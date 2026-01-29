import { useState, useRef, useCallback } from "react";
import { ElementType } from "../types";

export const useHistory = (initialState: ElementType[]) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const indexRef = useRef(index);
  const historyRef = useRef(history);

  indexRef.current = index;
  historyRef.current = history;

  const setState = useCallback(
    (
      action: ElementType[] | ((current: ElementType[]) => ElementType[]),
      overwrite = false
    ) => {
      const currentHistory = historyRef.current;
      const currentIndex = indexRef.current;
      const newState =
        typeof action === "function"
          ? action(currentHistory[currentIndex])
          : action;
      if (overwrite) {
        const historyCopy = [...currentHistory];
        historyCopy[currentIndex] = newState;
        setHistory(historyCopy);
      } else {
        const updatedState = [...currentHistory].slice(0, currentIndex + 1);
        setHistory([...updatedState, newState]);
        setIndex((prevState) => prevState + 1);
      }
    },
    []
  );

  const undo = useCallback(
    () => setIndex((prevState) => (prevState > 0 ? prevState - 1 : prevState)),
    []
  );

  const redo = useCallback(
    () =>
      setIndex((prevState) =>
        prevState < historyRef.current.length - 1 ? prevState + 1 : prevState
      ),
    []
  );

  return {
    elements: history[index],
    setElements: setState,
    undo,
    redo,
  };
};



