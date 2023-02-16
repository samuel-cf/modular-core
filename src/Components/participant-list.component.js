import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap";
import ParticipantTableRow from "./ParticipantTableRow";
  
const ParticipantList = () => {
  const [participants, setParticipants] = useState([]);
  
  useEffect(() => {
    axios
      .get("http://localhost:4000/participants/")
      .then(({ data }) => {
        setParticipants(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  
  const DataTable = () => {
    return participants.map((res, i) => {
      return <ParticipantTableRow obj={res} key={i} />;
    });
  };
  
  return (
    <div className="table-wrapper">
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>{DataTable()}</tbody>
      </Table>
    </div>
  );
};
  
export default ParticipantList;