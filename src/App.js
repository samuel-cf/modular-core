
// Import React
import React from "react";
import axios from "axios";

// Import Bootstrap
import { Nav, Navbar, Container, Row, Col } 
        from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
  
// Import Custom CSS
import "./App.css";
  
// Import from react-router-dom
import { BrowserRouter as Router, Routes,
    Route, Link } from "react-router-dom";
  
// Import other React Component
import CreateParticipant from 
    "./Components/create-participant.component";
import EditParticipant from 
    "./Components/edit-participant.component";
import ParticipantList from 
    "./Components/participant-list.component";
  
function sendMail(name, email, amigo_secreto) {
      var params = {
      name: name,
      email: email,
      amigo_secreto: amigo_secreto
      };


      const serviceID = "service_0w0q0sr"; //.env
      const templateID = "template_q6lr9ko"; //.env
        axios.post("https://api.emailjs.com/api/v1.0/email/send", {
          service_id: serviceID,
          template_id: templateID,
          user_id: "qX1V3uT9ceOX5pvtF",
          template_params: params,
        })
        .then(res=>{
          console.log(res);
          console.log("Your message was sent successfully!!")

        })
        .catch(err=>console.log(err));

};


// App Component
const App = () => {
  const Sorteio = () => {
    axios.get('http://localhost:4000/participants/sortear')
      .then(res => {
        if (res.status === 200){
          for (let i = 0; i< res.data.length; i++) {
            let name = res.data[i][0]
            let mail = res.data[i][1]
            let amigo = res.data[i][2]
            sendMail(name, mail, amigo)
          }
          alert("Sorteio realizado!")
        }
        else
          Promise.reject()
      })
      .catch(err => alert('Something went wrong'))
  }
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Navbar bg="dark" variant="dark">
            <Container>
              <Navbar.Brand>
                <Link to={"/create-participant"} 
                  className="nav-link">
                  Amigo Secreto
                </Link> 
                <div>
                      <button class = "btn btn-primary" onClick = {Sorteio}> Sortear </button>  
                </div>

              </Navbar.Brand>
  
              <Nav className="justify-content-end">
                <Nav>
                  <Link to={"/create-participant"} 
                    className="nav-link">
                    Inserir Participante
                  </Link>
                </Nav>
  
                <Nav>
                  <Link to={"/participant-list"} 
                    className="nav-link">
                    Lista de Participantes
                  </Link>
                </Nav>
              </Nav>
            </Container>
          </Navbar>
        </header>
  
        <Container>
          <Row>
            <Col md={12}>
              <div className="wrapper">
                <Routes>
                  <Route exact path="/" 
                    element={<CreateParticipant/>} />
                  <Route path="/create-participant" 
                    element={<CreateParticipant/>} />
                  <Route path="/edit-participant/:id" 
                    element={<EditParticipant/>} />
                  <Route path="/participant-list" 
                    element={<ParticipantList/>} />
                </Routes>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </Router>
  );
};
  
export default App;