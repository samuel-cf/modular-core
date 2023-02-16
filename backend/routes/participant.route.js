let mongoose = require("mongoose"),
express = require("express"),
router = express.Router();
	function shuffle(array) {
		let randomIndex;
		let currentIndex = array.length;
	
		// While there remain elements to shuffle.
		while (currentIndex != 0) {
	
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
	
		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
		}
	
		return array;
	};

	function arrayIndices(tamanho) {
		 
		var arr = [];
		var step = (tamanho-1) / (tamanho - 1);
		for (var i = 0; i < tamanho; i++) {
		arr.push((step * i));
		}
		return arr;
	};
  

	function compareArrays (a, b)  {
		  // Comparing each element of your array
		  for (var i = 0; i < a.length; i++) {
			if (a[i] == b[i]) {return true}
		  }
		  return false;
	};

// Participant Model
let participantSchema = require("../models/Participant");

// CREATE Participant
router.post("/create-participant", (req, res, next) => {
participantSchema.create(req.body, (error, data) => {
	if (error) {
	return next(error);
	} else {
	console.log(data);
	res.json(data);
	}
});
});

// READ Participants
router.get("/", (req, res) => {
participantSchema.find((error, data) => {
	if (error) {
	return next(error);
	} else {
	res.json(data);
	}
});
});

//SORTEIO
router.get("/sortear", async(req, res) => {
	const participante = await participantSchema.find();
	console.log(participante);

	const n_part = participante.length;
	const indices = arrayIndices(n_part);
	let correspondencia = shuffle(arrayIndices(n_part));
	let comparacao = compareArrays(indices, correspondencia);

	while (comparacao  == true){
		correspondencia = shuffle(arrayIndices(n_part));
		comparacao = compareArrays(indices, correspondencia);
	}

	let infos_email = [];

	for (let i = 0; i < n_part; i++){
		let nome = participante[i]["name"];
		let e_mail = participante[i]["email"];
		let amigo = participante[correspondencia[i]]["name"];

		infos_email.push([nome, e_mail, amigo])
	}

	const sorteio =	infos_email// resultado do sorteio
	res.json(sorteio);
});


// UPDATE participant
router
.route("/update-participant/:id")
// Get Single Participant
.get((req, res) => {
	participantSchema.findById(
		req.params.id, (error, data) => {
	if (error) {
		return next(error);
	} else {
		res.json(data);
	}
	});
})

// Update Participant Data
.put((req, res, next) => {
	participantSchema.findByIdAndUpdate(
	req.params.id,
	{
		$set: req.body,
	},
	(error, data) => {
		if (error) {
		return next(error);
		console.log(error);
		} else {
		res.json(data);
		console.log("Participant updated successfully !");
		}
	}
	);
});

// Delete Participant
router.delete("/delete-participant/:id",
(req, res, next) => {
participantSchema.findByIdAndRemove(
	req.params.id, (error, data) => {
	if (error) {
	return next(error);
	} else {
	res.status(200).json({
		msg: data,
	});
	}
});
});

module.exports = router;
