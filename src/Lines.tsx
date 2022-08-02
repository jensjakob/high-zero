import { initializeApp } from "firebase/app";
import {
  Timestamp,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHRC9eR3OVrw_ZLO_5XcG3dosXPW1ARuY",
  authDomain: "high-zero.firebaseapp.com",
  projectId: "high-zero",
  storageBucket: "high-zero.appspot.com",
  messagingSenderId: "1026053235805",
  appId: "1:1026053235805:web:fdf867b24d2b63951319b4",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface ILine {
  id: string;
  name: string;
  value: number;
  times_per_year: number;
  start: Timestamp;
  end: Timestamp;
}

interface IDay {
  [key: string]: {
    sum: number;
  };
}

const Lines = () => {
  const [lines, setLines] = useState<ILine[]>();
  const [cal, setCal] = useState<IDay>({});

  const theDayDate = new Date();
  const today = new Date(new Date().toDateString());
  const firebaseDate = Timestamp.fromDate(theDayDate);

  let calendar: IDay = {};

  useEffect(() => {
    const collectionRef = collection(db, "lines");

    const q = query(collectionRef, where("end", ">=", firebaseDate));

    const unsubscribe = onSnapshot(q, (snapshot) =>
      setLines(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          value: doc.data().value,
          times_per_year: doc.data().times_per_year,
          start: doc.data().start,
          end: doc.data().end,
        }))
      )
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function forEachDay(
    startDate: Date,
    endDate: Date,
    callback: (date: Date) => void
  ) {
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      callback(currentDate);

      // Add one day and loop
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  useEffect(() => {
    if (lines) {
      // One year from the day
      let endDate = new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      );

      // Initiate all days in the right order
      forEachDay(theDayDate, endDate, (currentDate) => {
        calendar[format(currentDate, "yyyy-MM-dd")] = {
          sum: 0,
        };
      });

      for (const line of lines) {
        const dayValue = (line.value * line.times_per_year) / 365;

        forEachDay(today, line.end.toDate(), (date) => {
          if (line.start.toDate() <= date) {
            const oldValue = calendar[format(date, "yyyy-MM-dd")].sum;
            calendar[format(date, "yyyy-MM-dd")] = { sum: dayValue + oldValue };
          }
        });

        setCal({ ...calendar });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  let added = 0;

  const data = Object.keys(cal).map((item) => {
    added += cal[item].sum;
    return {
      name: item,
      value: cal[item].sum,
      added: added,
    };
  });

  return (
    <div>
      <LineChart width={600} height={200} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" fontSize={10} />
        <YAxis fontSize={10} />
        <Tooltip />
        <Line type="stepAfter" dataKey="added" strokeWidth={2} />
      </LineChart>
      <h2>{format(theDayDate, "yyyy-MM-dd")}</h2>
      <table
        style={{
          width: "auto",
          border: "solid 1px white",
          borderSpacing: "20px",
        }}
      >
        <thead>
          <tr>
            <th>Status</th>
            <th>Name</th>
            <th>kr/day</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {lines?.map((line) => (
            <tr key={line.id}>
              <td>{line.start.toDate() > theDayDate ? "WAIT 🚫" : ""}</td>
              <td>{line.name}</td>
              <td>{Math.round((line.times_per_year * line.value) / 365)} kr</td>
              <td>{format(line.start.toDate(), "yyyy-MM-dd")}</td>
              <td>{format(line.end.toDate(), "yyyy-MM-dd")}</td>
              <td>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>
              <button>Add</button>
            </td>
          </tr>
        </tfoot>
      </table>

      {cal[format(theDayDate, "yyyy-MM-dd")] && (
        <div>
          Totalt: {Math.round(cal[format(theDayDate, "yyyy-MM-dd")].sum)} kr/dag
        </div>
      )}
    </div>
  );
};

// <ol>
// {Object.keys(cal).map((key, index) => (
//   <li key={index}>
//     {key}: {cal[key].sum.toFixed(2)} kr/dag
//   </li>
// ))}
// </ol>

export default Lines;
