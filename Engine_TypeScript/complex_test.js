function greet(person) {
    return "Hello, ".concat(person.name, "! You are ").concat(person.age, " years old.");
}
var user = {
    name: "Alice",
    age: 30
};
console.log(greet(user));
