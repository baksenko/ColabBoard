import tensorflow as tf
import tensorflow_datasets as tfds
import numpy as np
import os

DATASET_NAME = 'emnist/byclass'
BATCH_SIZE = 128
EPOCHS = 25
IMG_SHAPE = (28, 28, 1)
MODEL_DIR = 'saved_models/emnist_ocr'

def load_dataset():
    ds_train, ds_info = tfds.load(DATASET_NAME, split='train', as_supervised=True, with_info=True)
    ds_test = tfds.load(DATASET_NAME, split='test', as_supervised=True)

    def preprocess(img, label):
        img = tf.cast(img, tf.float32) / 255.0
        # EMNIST is rotated; you may want to rotate/transpose depending on source. Adjust if characters look rotated.
        img = tf.expand_dims(img, -1) if img.shape.ndims == 2 else img
        return img, label

    ds_train = ds_train.map(preprocess).shuffle(10000).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    ds_test = ds_test.map(preprocess).batch(BATCH_SIZE).prefetch(tf.data.AUTOTUNE)
    return ds_train, ds_test, ds_info

def res_block(x, filters):
    shortcut = x

    # First conv
    y = tf.keras.layers.Conv2D(filters, 3, padding="same", use_bias=False)(x)
    y = tf.keras.layers.BatchNormalization()(y)
    y = tf.keras.layers.ReLU()(y)

    # Second conv
    y = tf.keras.layers.Conv2D(filters, 3, padding="same", use_bias=False)(y)
    y = tf.keras.layers.BatchNormalization()(y)

    # Match dimensions if needed
    if shortcut.shape[-1] != filters:
        shortcut = tf.keras.layers.Conv2D(filters, 1, padding="same", use_bias=False)(shortcut)
        shortcut = tf.keras.layers.BatchNormalization()(shortcut)

    # Add skip connection
    out = tf.keras.layers.Add()([shortcut, y])
    out = tf.keras.layers.ReLU()(out)
    return out


def build_model(num_classes):
    inputs = tf.keras.Input(shape=(28, 28, 1))

    # Initial conv
    x = tf.keras.layers.Conv2D(32, 3, padding="same", use_bias=False)(inputs)
    x = tf.keras.layers.BatchNormalization()(x)
    x = tf.keras.layers.ReLU()(x)

    # Residual blocks
    x = res_block(x, 32)
    x = res_block(x, 32)

    x = res_block(x, 64)
    x = tf.keras.layers.MaxPool2D()(x)

    x = res_block(x, 64)
    x = res_block(x, 128)

    # Global pooling
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    x = tf.keras.layers.Dropout(0.3)(x)

    outputs = tf.keras.layers.Dense(num_classes, activation="softmax")(x)

    model = tf.keras.Model(inputs, outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )

    return model

def build_label_map(ds_info):
    # ds_info.features['label'].names exists for many tfds datasets
    if 'label' in ds_info.features:
        names = ds_info.features['label'].names
        # names is list of strings corresponding to class indices
        return names
    return None

def main():
    ds_train, ds_test, ds_info = load_dataset()
    num_classes = ds_info.features['label'].num_classes
    model = build_model(num_classes)
    model.summary()
    model.fit(ds_train, epochs=EPOCHS, validation_data=ds_test)

    # Save model
    os.makedirs(MODEL_DIR, exist_ok=True)
    model.save(MODEL_DIR, include_optimizer=False, save_format='tf')
    print(f"Saved model to {MODEL_DIR}")

    # Save class mapping to a JSON/text file
    import json
    label_names = ds_info.features['label'].names
    with open(os.path.join(MODEL_DIR, 'labels.json'), 'w') as f:
        json.dump(label_names, f)
    print("Saved labels.json")

if __name__ == '__main__':
    main()
