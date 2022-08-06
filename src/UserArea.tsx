import { useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

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
const auth = getAuth(app);

const UserArea = (props: { onLogin: (user: string) => void }) => {
  // const UserArea = ({ onLogin }) => {
  const inputRefEmail = useRef<HTMLInputElement>(null);
  const inputRefPassword = useRef<HTMLInputElement>(null);

  async function login(event: { preventDefault: () => void }) {
    event.preventDefault();

    const email = inputRefEmail.current!.value;
    const password = inputRefPassword.current!.value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        props.onLogin(userCredential.user.uid);
        console.log(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
      });
  }

  async function createUser() {
    const email = inputRefEmail.current!.value;
    const password = inputRefPassword.current!.value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        props.onLogin(userCredential.user.uid);
        console.log(userCredential.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log(errorCode, errorMessage);
      });
  }

  // if (user) {
  //   return (
  //     <div>User: {user}</div>
  //   )
  // }

  return (
    <div>
      <form>
        <input type="email" name="email" ref={inputRefEmail} />
        <input type="password" name="password" ref={inputRefPassword} />
        <button onClick={login}>Login</button>
        <button type="button" onClick={createUser}>
          Create user
        </button>
      </form>
    </div>
  );
};

export default UserArea;
