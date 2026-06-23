import { useState } from "react";

export default function Task2() {
  const [users, setUsers] = useState([
    { id: 1, name: "John", age: 25 },
    { id: 2, name: "LJ", age: 27 },
    { id: 3, name: "Merry", age: 24 },
    { id: 4, name: "Kitty", age: 22 },
    { id: 5, name: "Peter", age: 28 },
  ]);

  const exportToJSON = () => {
    //
    const jsonString = JSON.stringify(users, null, 2);
    //create file dynamically in memory and download it
    const blob = new Blob([jsonString], {
      type: "application/json",
    });
    //temporary url
    const url = URL.createObjectURL(blob);
    //trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "user.json";
    a.click();
    //cleanup memory
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div style={{ padding: "20px" }}>
        <h2>Users Table</h2>

        <button onClick={exportToJSON}>Export JSON</button>

        <table className="border mt-10" cellPadding="10">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
