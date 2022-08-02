import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  Timestamp,
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  orderBy,
} from "firebase/firestore";
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

  const inputRefName = useRef<HTMLInputElement>(null);
  const inputRefValue = useRef<HTMLInputElement>(null);
  const inputRefTimes = useRef<HTMLSelectElement>(null);
  const inputRefStart = useRef<HTMLInputElement>(null);
  const inputRefEnd = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const collectionRef = collection(db, "lines");

    const q = query(
      collectionRef,
      where("end", ">=", firebaseDate),
      orderBy("end"),
      orderBy("value")
    );

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

  async function deleteLine(ref: string) {
    await deleteDoc(doc(db, "lines", ref));
  }

  async function addLine(event: { preventDefault: () => void }) {
    event.preventDefault();

    if (
      inputRefName.current?.value &&
      inputRefValue.current?.value &&
      inputRefTimes.current?.value &&
      inputRefStart.current?.value &&
      inputRefEnd.current?.value
    ) {
      const data = {
        name: inputRefName.current?.value,
        value: inputRefValue.current?.value,
        times_per_year: inputRefTimes.current?.value,
        start: new Date(inputRefStart.current?.value),
        end: new Date(inputRefEnd.current?.value),
      };

      console.debug(data);

      try {
        // const docRef = await addDoc(collection(db, "lines"), {
        await addDoc(collection(db, "lines"), data);
        // console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
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

      <form onSubmit={addLine}>
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
                <td>
                  {Math.round((line.times_per_year * line.value) / 365)} kr (
                  {Math.round(line.value).toString()} kr ×{line.times_per_year})
                </td>
                <td>{format(line.start.toDate(), "yyyy-MM-dd")}</td>
                <td>{format(line.end.toDate(), "yyyy-MM-dd")}</td>
                <td>
                  <button type="button" onClick={() => deleteLine(line.id)}>
                    X
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>New</td>
              <td>
                <input
                  type="text"
                  name="name"
                  defaultValue="Name"
                  ref={inputRefName}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="value"
                  defaultValue="100"
                  ref={inputRefValue}
                />
                <select name="times_per_year" ref={inputRefTimes}>
                  <option value="12">månadsvis</option>
                  <option value="4">kvartal</option>
                  <option value="3">4:e månad</option>
                  <option value="1">per år</option>
                </select>
              </td>
              <td>
                <input
                  type="date"
                  name="start"
                  defaultValue={format(
                    new Date(new Date().getFullYear(), 0, 1),
                    "yyyy-MM-dd"
                  )}
                  // defaultValue={format(theDayDate, "yyyy-MM-dd")}
                  ref={inputRefStart}
                />
              </td>
              <td>
                <input
                  type="date"
                  name="end"
                  defaultValue={format(
                    new Date(new Date().getFullYear(), 11, 31),
                    "yyyy-MM-dd"
                  )}
                  ref={inputRefEnd}
                />
              </td>
              <td>
                <button>Add</button>
              </td>
            </tr>
          </tfoot>
        </table>
      </form>

      {cal[format(theDayDate, "yyyy-MM-dd")] && (
        <div>
          Totalt: {cal[format(theDayDate, "yyyy-MM-dd")].sum.toFixed(2)} kr/dag
        </div>
      )}
    </div>
  );
};

export default Lines;
