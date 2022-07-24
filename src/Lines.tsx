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
}

const Lines = () => {
  const [lines, setLines] = useState<ILine[]>();

  useEffect(() => {
    const theDayDate = new Date();
    const firebaseDate = Timestamp.fromDate(theDayDate);

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
        }))
      )
    );

    return unsubscribe;
  }, []);

  return (
    <ol>
      {lines?.map((line) => (
        <li key="{line.id}">
          {line.name}: {Math.round((line.times_per_year * line.value) / 365)}{" "}
          kr/dag
        </li>
      ))}
    </ol>
  );
};

export default Lines;
