import reactLogo from "./assets/react.svg";
import "./App.css";
import { gql, useQuery } from "@apollo/client";

const ALL_PERSONS = gql`
  query {
    allPersons {
      id
      name
      phones
      address {
        street
        city
      }
    }
  }
`;

function App() {
  const { data, error, loading } = useQuery(ALL_PERSONS);

  if (error) return <span style="color: red">Error</span>;

  return (
    <div className="App">
      {loading && <p>Loading...</p>}
      {data && <p>Ok</p>}
    </div>
  );
}

export default App;
