"use strict";

/**
 * Author: Mike Musselman
 * Date: Feb 14 / 25
 * CWEB190 Assign 2
 */

//Car object constructor
class Car {
    constructor(id, image, vPosition) {
        this.id = id;
        this.image = image;
        this.hPosition = 0; //Starts at left edge
        this.vPosition = vPosition;
        this.finishedRace = false;
        this.wins = 0;
    }

    //Method to return car to starting position
    resetCar() {
        this.hPosition = 0;
        this.finishedRace = false;
    }

    //Method to return a String with inline styles for absolute positioning
    draw() {
        return `<img src="${this.image}" style="position:absolute; left:${this.hPosition}px;
                top:${this.vPosition}px;" \>`;
    }

    //Method to generate a random movement between 1 and 10 pixels
    move() {
        const randomDistance = Math.floor(Math.random() * 10) + 1;
        this.hPosition += randomDistance;
        //Check if car has passed finish line
        if (this.hPosition >= 1000 && !this.finishedRace) {
            this.finishedRace = true;
        }
    }
}

//Race object constructor
class Race {
    constructor(carArray) {
        this.carArray = carArray;
        this.raceOver = false;
        this.standings = []; //Array to store finished cars positions
        this.numCarsDone = 0;
        this.totalRaces = 0;
    }

    //Method to move cars in the race
    moveCars() {
        for (const car of this.carArray) {
            //Only move if not finished
            if (!car.finishedRace) {
                car.move();
                //If finished add to the standings
                if (car.finishedRace) {
                    this.addToStandings(car);
                }
            }
        }
        //Update the display
        this.drawCars();

        //When all cars have finished the race
        if (this.numCarsDone === this.carArray.length) {
            clearInterval(raceInterval);
            this.raceOver = true;
            this.totalRaces++;
            //Award a win to the first car to finish
            if (this.standings.length > 0) {
                this.standings[0].wins++;
            }
            //Alert to display the standings
            alert("Race Over! Standings: " + this.standings.map(
                (car, index) => `${index + 1}: ${car.id}`).join(", "));
        }
    }

    //Method to draw cars in each instance of the race
    drawCars() {
        const racePara = document.getElementById("racePara");
        racePara.innerHTML = "";
        for (const car of this.carArray) {
            racePara.innerHTML += car.draw();
        }
    }

    //Method to restart all the car objects to their initial state
    resetCars() {
        for (const car of this.carArray) {
            car.resetCar();
        }
        this.raceOver = false;
        this.standings = [];
        this.numCarsDone = 0;
        this.drawCars();
    }

    //Method to add cars to standings when finished the race
    addToStandings(car) {
        if (!this.standings.includes(car)) {
            this.standings.push(car);
            this.numCarsDone++;
        }
    }

    //Method to display statistics
    displayStats() {
        let stats = "Statistics:\n";
        for (const car of this.carArray) {
            stats += `${car.id}: ${car.wins}\n`;
        }
        alert(stats);
    }

}
//Global variable for interval
let raceInterval;

window.onload = function () {
    //Create car objects
    const cars = [
        new Car("Classic", "images/car1.png", 150),
        new Car("Bug", "images/car2.png", 350),
        new Car("Hatchback", "images/car3.png", 550),
        new Car("Sedan", "images/car4.png", 750),
    ];

    //Create a Race object with cars in the array
    const race = new Race(cars);
    race.drawCars();


    //Event handler for race start. Disables other buttons to reduce errors
    document.getElementById("btnStart").addEventListener("click", function () {
        document.getElementById("btnStart").disabled = true;
        document.getElementById("btnStats").disabled = true;
        document.getElementById("btnReset").disabled = false;

        //Race Interval to move cars every 10 milliseconds
        raceInterval = setInterval(() => {
            race.moveCars();
        }, 10);
    });

    //Event handler for race reset
    document.getElementById("btnReset").addEventListener("click", function () {
        clearInterval(raceInterval);
        race.resetCars();
        document.getElementById("btnStart").disabled = false;
        document.getElementById("btnStats").disabled = false;
        document.getElementById("btnReset").disabled = true;
    });

    //Event handler fo view statistics
    document.getElementById("btnStats").addEventListener("click", function () {
        race.displayStats();
    });
};
