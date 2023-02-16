# Informações relevantes
## Utilidade
Esse projeto faz sorteios de amigo secreto, enviando um e-mail para cada pessoa e evitando que uma pessoa sorteie ela mesma.

## Metodologias
Para o backend, foi utilizado nodejs e para o frontend foi utilizado react. Os dados dos participantes do sorteio foram armazenados em um base de dados no mongodb. Para o envio dos e-mails, utilizou-se o smtp gratuito emailjs.com.  

## Observações
1 - Os arquivos referentes ao backend estão no diretório "\mern-stack-crud\backend", enquanto que os demais arquivos na pasta "mern-stack-crud" são referentes ao backend.
2 - A função que realiza o sorteio em si está no diretório "\mern-stack-crud\backend\routes\participant.route.js"
3 - A função que utiliza os dados do sorteio para mandar os e-mails esta no diretório "\mern-stack-crud\src\App.js"
4 - O sorteio foi feito utilizando os índices da lista dos participantes registrados na base de dados. É feita uma ordenação aleatória desses índices em uma array e é checado se nenhum índice permaneceu na mesma posição que estava. Após isso, o sorteio está concluído e a cada índice (presenteador) corresponde um índice aleatório (presenteado).