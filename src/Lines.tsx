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
  Legend,
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
  end: Timestamp;
  // TODO: Add start
}

interface IDay {
  [key: string]: {
    sum: number;
  };
}

const Lines = () => {
  const [lines, setLines] = useState<ILine[]>();
  const [sum, setSum] = useState(0);
  const [cal, setCal] = useState<IDay>({});

  const theDayDate = new Date();
  const firebaseDate = Timestamp.fromDate(theDayDate);

  let calendar: IDay = {};

  useEffect(() => {
    const collectionRef = collection(db, "lines");

    const q = query(
      collectionRef,
      // TODO: Add support for starts in the future
      // where("start", "<=", firebaseDate),
      where("end", ">=", firebaseDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) =>
      setLines(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          value: doc.data().value,
          times_per_year: doc.data().times_per_year,
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
    let currentDate = startDate;

    while (currentDate < endDate) {
      callback(currentDate);

      // Add one day and loop
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  function addSumToObject(object: Object, fieldToSum: string) {
    // return object.reduce((previousValue, currentValue) => {
    //   return previousValue + currentValue[fieldToSum];
    // }, 0);
    // console.debug(object);
    // let newObject: Object;
    // // let sum = 0;
    // for (const line in Object.keys(object)) {
    //   if (line) {
    //     newObject[line] = sum;
    //   }
    //   // sum += item[fieldToSum];
    //   // newObject = {...line, added: sum; // + object[line][fieldToSum];
    // }
    // return Object.keys(cal).map((item) => {
    // sum += item[fieldToSum];
    // return { ...item, sum };
    // return item;
    // });
    // Object.keys(cal).map((key, index) => (
    //   <li key={index}>
    //     {key}: {cal[key].sum.toFixed(2)} kr/dag
    //   </li>
    // ))
  }

  useEffect(() => {
    setSum(0);
    if (lines) {
      let endDate = new Date(theDayDate);
      endDate.setFullYear(theDayDate.getFullYear() + 1);

      // Initiate all days in the right order
      // TODO: Use fuction
      let currentDate = new Date(theDayDate);
      while (currentDate < endDate) {
        calendar[format(currentDate, "yyyy-MM-dd")] = {
          sum: 0,
        };

        // Add one day and loop
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const line of lines) {
        const dayValue = (line.value * line.times_per_year) / 365;
        setSum((prev) => prev + dayValue);

        forEachDay(theDayDate, line.end.toDate(), (date) => {
          // TODO: Don't overwrite
          calendar[format(date, "yyyy-MM-dd")] = { sum: dayValue };
        });

        setCal({ ...calendar });
      }

      console.debug(addSumToObject(cal, "value"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines]);

  // const data = Object.keys(cal).map((key) => ({
  //   name: key,
  //   value: cal[key].sum,
  // }));

  let added = 0;

  // function mapFunction(item: any) {
  //   added += cal[item].sum;
  //   return {
  //     name: item.name,
  //     value: cal[item].sum,
  //     added: added,
  //   };
  // }
  // const data = Object.keys(cal).map(mapFunction);

  const data = Object.keys(cal).map((item) => {
    added += cal[item].sum;
    return {
      name: item,
      value: cal[item].sum,
      added: added,
    };
  });

  console.debug(data);

  // const data = [
  //   { name: "2020-01-01", value: 1 },
  //   { name: "2020-01-02", value: 2 },
  // ];

  return (
    <div>
      <LineChart width={600} height={200} data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="stepAfter" dataKey="added" stroke="#fff" strokeWidth={2} />
      </LineChart>
      <h2>{format(theDayDate, "yyyy-MM-dd")}</h2>
      <div>Totalt {Math.round(sum)} kr/dag</div>
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
