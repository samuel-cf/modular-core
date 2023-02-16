
import React from "react";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
  
const ParticipantTableRow = (props) => {
  const { _id, name, email} = props.obj;
  
  const deleteParticipant = () => {
    axios
      .delete(
"http://localhost:4000/participants/delete-participant/" + _id)
      .then((res) => {
        if (res.status === 200) {
          alert("Participant successfully deleted");
          window.location.reload();
        } else Promise.reject();
      })
      .catch((err) => alert("Something went wrong"));
  };
  
  return (
    <tr>
      <td>{name}</td>
      <td>{email}</td>
      <td>
        <Link className="edit-link" 
          to={"/edit-participant/" + _id}>
          Editar
        </Link>
        <Button onClick={deleteParticipant} 
          size="sm" variant="danger">
          Deletar
        </Button>
      </td>
    </tr>
  );
};
  
export default ParticipantTableRow;