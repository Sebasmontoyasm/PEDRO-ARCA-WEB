import bcrypt from "bcryptjs";
//Sebastian
//const password = "MiClave123";

//Juan Sebastian Mock
//const password = "(8wav03704Tn";

//Yoa
//const password = "1\m8FeJh032|";

//Luis Osorio
//const password = +sR03@}2rt!3;

//Felipe
//const password = "4{t;uyN6a~1P";

const salt = bcrypt.genSaltSync(10);

const password_hash = bcrypt.hashSync(password + salt, 10);

console.log("Salt generado:", salt);
console.log("Hash generado:", password_hash);
