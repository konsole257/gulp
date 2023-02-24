// import { sayHello } from './greet.js';
// console.log(sayHello('TypeScript'));

const num: number = 1;

let color: 'red'|'blue'|'black';

color = 'red';

// console.log(color);

class Ts {
	width: number;
	height: number;
	text: string;

	constructor(width: number, height: number, text: string) {
		this.width = width || 10;
		this.height = height || 10;
		this.text = text;
	}

	calc() {
		return this.width + this.height;
	}

	get txt() {
		return this.text;
	}

	get calcResult() {
		return this.calc();
	}
};

interface PersonInterface {
	name: string;
	age?: number;
};

interface AddPersonInterface extends PersonInterface {
	script: string[];
};

const personA: PersonInterface = {
	name: '김하나',
	age: 20,
};

const personB: AddPersonInterface = {
	name: '김둘',
	age: 25,
	script: ['js']
};

const personC: AddPersonInterface = {
	name: '김셋',
	script: ['js', 'ts']
};

const person: PersonInterface[] = [personA, personB, personC];

// console.log(person);