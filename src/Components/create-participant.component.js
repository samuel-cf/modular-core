// CreateParticipant Component for add new participant

// Import Modules
import React, { useState, useEffect } from "react";
import axios from 'axios';
import ParticipantForm from "./ParticipantForm";
  
// CreateParticipant Component
const CreateParticipant = () => {
  const [formValues, setFormValues] = 
    useState({ name: '', email: ''})
  // onSubmit handler
  const onSubmit = participantObject => {
    axios.post(
'http://localhost:4000/participants/create-participant', 
    participantObject)
      .then(res => {
        if (res.status === 200)
          alert('Participant successfully created')
        else
          Promise.reject()
      })
      .catch(err => alert('Something went wrong'))
  }
  // Return participant form
  return(
    <ParticipantForm initialValues={formValues} 
      onSubmit={onSubmit} 
      enableReinitialize>
      Inserir Participante
    </ParticipantForm>
    
  )
}

// Export CreateParticipant Component
export default CreateParticipant