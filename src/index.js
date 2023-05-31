import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import Test from "./Test";
import Profile from "./Profile";
import Enumerator from "./Enumerator";
import Previous from "./Previous"
import Video from "./Video";
import "./Login.css";
import File from "./File";
import Allcontent from "./Allcontent.js";
import Userid from "./Userid";
import Online from "./Online"
ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/enumerator" element={<Enumerator />} />
      <Route path="/test" element={<Test />} />
      <Route path="/video" element={<Video />} />
      <Route path="/video" element={<Video />} />
      <Route path="/file" element={<File />} />
      <Route path="/previous" element={<Previous />} />
      <Route path="/allcontent" element={<Allcontent />} />
      <Route path="/userid" element={<Userid />} />
      <Route path="/online" element={<Online />} />

      <Route path="/profile/:id" element={<Profile />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById("root")
);
