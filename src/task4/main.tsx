import { useState, useEffect } from "react";
import { getDashboard, getUsers, getRoles } from "./service";

export default function PromiseApi() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboard, setDashboard] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, roles, dashboard] = await Promise.all([
          getUsers(),
          getRoles(),
          getDashboard(),
        ]);
        // console.log(users);
        setUsers(users);
        setRoles(roles);
        console.log(roles);
        setDashboard(dashboard);
        console.log(dashboard);
      } catch (error) {
        setError("Failed to fetch data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return (
    <>
      <div className="flex flex-row justify-center items-center align-middle bg-amber-100 h-screen">
        <div className="bg-blue-300 h-200 w-100 pl-3 mt-5">
          <h1>
            <strong>Users</strong>
          </h1>
          {/* {users?.map((user) => (
          <div key={user.id}>
            <p>
              Name: {user.firstName} {user.lastName}
            </p>
            <p>Email: {user.email}</p>
            <br />
          </div>
        ))} */}

          {/* {users
          .filter((user) => user.firstName === "Veedhi")
          .map((user) => (
            <div key={user.id}>
              <p>
                Name: {user.firstName} {user.lastName}
              </p>
              <p>Email: {user.email}</p>
            </div>
          ))} */}
          {users.slice(0, 10).map((user) => (
            <div key={user.id}>
              <p>
                {user.firstName} {user.lastName}
              </p>
            </div>
          ))}
        </div>
        <div className="bg-blue-300 h-200 w-100 pl-3 mt-5 ml-5">
          <h1>
            <strong>Roles</strong>
          </h1>
          {roles.slice(0, 5).map((rr) => (
            <div key={rr.id}>
              <p>{rr.title}</p>
            </div>
          ))}
        </div>
        <div className="bg-blue-300 h-200 w-100 pl-3 mt-5 ml-5">
          <h1>
            <strong>Dashboard Data</strong>
          </h1>
          {dashboard.map((user) => (
            <div key={user.id}>
              <p>{user.firstName}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
