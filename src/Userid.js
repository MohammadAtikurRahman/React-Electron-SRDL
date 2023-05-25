import React, { useState } from "react";
import { useEffect } from "react";

const Userid = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:2000/userid")
      .then((response) => response.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <div>
      {user && (
          user.userid
      )}
    </div>
  );
};

export default Userid;
