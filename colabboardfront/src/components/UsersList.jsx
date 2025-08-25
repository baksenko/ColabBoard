import "./UsersList.css";

export default function UsersList({
  users = [], activeUsers = []
}) {
  return (
    <aside className={`users-sidebar`}>
      <Section title={`ONLINE — ${activeUsers.length}`}>
        {activeUsers.map((u) => (
          <UserRow user={u} status="online"/>
        ))}
      </Section>

      <Section title={`OFFLINE — ${users.length - activeUsers.length}`}>
        {users.map((u) => (
          activeUsers.find((au) => au === u) ? null : <UserRow user={u} status="offline"/>
        ))}
      </Section>
    </aside>
  );
}

function Section({ title, children }) {
  return (
    <div className="us-section">
      <div className="us-section-title">{title}</div>
      <div className="us-list">{children}</div>
    </div>
  );
}

function UserRow({ user, status }) {
  return (
    <div className="us-row">
      <div className={`user-status ${status}`}>
        <span className="indicator"></span>
      </div>
      <div className="us-meta">
        <div className="us-name">{user}</div>
      </div>
    </div>
  );
}
