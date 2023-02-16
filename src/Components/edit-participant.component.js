// EditParticipant Component for update participant data
  
// Import Modules
import React, { useState, useEffect } from "react";
import axios from "axios";
import ParticipantForm from "./ParticipantForm";
  
// EditParticipant Component
const EditParticipant = (props) => {
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
  });
    
  //onSubmit handler
  const onSubmit = (participantObject) => {
    axios
      .put(
        "http://localhost:4000/participants/update-participant/" +
          props.match.params.id,
        participantObject
      )
      .then((res) => {
        if (res.status === 200) {
          alert("Participant successfully updated");
          props.history.push("/participant-list");
        } else Promise.reject();
      })
      .catch((err) => alert("Something went wrong"));
  };
  
  // Load data from server and reinitialize participant form
  useEffect(() => {
    axios
      .get(
        "http://localhost:4000/participants/update-participant/" 
        + props.match.params.id
      )
      .then((res) => {
        const { name, email} = res.data;
        setFormValues({ name, email});
      })
      .catch((err) => console.log(err));
  }, []);
  
  // Return participant form
  return (
    <ParticipantForm
      initialValues={formValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      Update Participant
    </ParticipantForm>
  );
};
  
// Export EditParticipant Component
export default EditParticipant;