import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ParentComponent = () => {
    const [userId, setUserId] = useState(null);

    const sendData = async () => {
        const data = {
            userId: userId,
            // other data...
        };

        try {
            const response = await axios.post("http://localhost:2000/pcinfo", data);
            console.log(response.data);
            // other actions...
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <Userid setUserId={setUserId} />
            {/* other components and JSX... */}
        </div>
    );
};

const Userid = ({ setUserId }) => {
    useEffect(() => {
        fetch("http://localhost:2000/userid")
        .then((response) => response.json())
        .then((data) => {
            setUserId(data.userid);
        });
    }, []);

    return null;
};

export default ParentComponent;
