"use strict";

/*
 Filename:    whackamole.js
 Student:     Mike Musselman
 Course:      CWEB 190 (Internet Programming/Web Applications 1)
 Date: April 5 2025
 Purpose:     JavaScript for Whack-A-Mole game, Assignment #4
*/

// Global Variables
const NUM_HOLES = 16;
let timerId = null;
let currentMoles = 0;
let numRegWhacked = 0;
let numSpecialWhacked = 0;
let points = 0;
let maxMoles = 6;


// Create the div elements for the mole holes with their corresponding IDs
let holesString = "";
for (let i = 1; i <= NUM_HOLES; i++) {
    holesString += `<div id="hole${i}"></div>`
}
document.getElementById("holes").innerHTML = holesString;

/**
 * Function to preload images and fire handlers
 */
$(function () {

    //Preload Images
    preloadMoleImages();

    //Set up Hole Clicks
    holeClickHandler();

    //Set up Start Button
    startButtonHandler();
});

/**
 * Function to preload Mole Images
 */
function preloadMoleImages() {
    let moleRegular = new Image();
    moleRegular.src = "images/newmole.png";
    let moleSpecial = new Image();
    moleSpecial.src = "images/newmole2.png";
}

/**
 * Function to handle when holes are clicked
 */
function  holeClickHandler() {

    //Select all holes
    $("#holes div").on("click", function () {
        let hole = $(this);

        //No mole here if it contains target class so return
        if (!hole.hasClass("target")) {
            return;
        }

        // Slide up the image of the mole over 1 second if it is there then remove it
        hole.find("img").slideUp(1000, function () {
            $(this).remove();
        });

        //Add points depending on the mole that is clicked
        if (hole.hasClass("special")) {
            //Special mole
            points += 10000;
            numSpecialWhacked++;
        } else {
            //Regular mole
            points += 111;
            numRegWhacked++;
        }

        //Remove the classes so no mole is here anymore
        hole.removeClass("target special");

        //Decrement the moles on screen
        currentMoles--;

        //Update the scoreboard
        updatePointsDisplay();
    });
}

/**
 * Function to handle the Start Button
 */
function startButtonHandler() {
    $("#btnStart").on("click", function () {

        //Hide result display
        $("#results").hide();

        //Reset hole area
        $("#holes").css("opacity", 1).show();
        $("#holes div").empty().removeClass("target special");

        //Reset game variables
        points = 0;
        currentMoles = 0;
        numSpecialWhacked = 0;
        numRegWhacked = 0;

        //Update scores
        updatePointsDisplay();

        //Disable the start button
        $(this).prop("disabled", true);

        //Start the interval timer to spawn moles
        timerId = setInterval(createMole, 500);
    });
}

/**
 * Function to spawn the moles in random available holes
 */
function createMole() {
    //If 6 or more moles appear end the game
    if (currentMoles >= maxMoles) {
        endGame();
        return;
    }

    //Find which holes are available
    let allHoles = $("#holes div");
    let availableHoles = allHoles.filter(function () {
        return !$(this).hasClass("target");
    });

    //If there are no available holes end the game
    if (availableHoles.length === 0) {
        endGame();
        return;
    }

    //Randomly pick a hole from available holes
    let randomIndex = Math.floor(Math.random() * availableHoles.length);
    let chosenHole = $(availableHoles[randomIndex]);

    //Decide if new mole is special
    let isSpecial = Math.random() < 0.25;

    //Choose the image file
    let imageURL = isSpecial ? "images/newmole2.png" : "images/newmole.png";

    //Create img element for the mole
    let moleImg = $(`<img src="${imageURL}" style="display:none">`);

    //Append the img to the chosen hole
    chosenHole.append(moleImg);

    //Fade the image in over .5 seconds
    moleImg.fadeIn(500);

    //Mark the hole as occupied
    chosenHole.addClass("target");

    //Mark if it is a special mole
    if (isSpecial) {
        chosenHole.addClass("special");
    }

    //Increase count of moles on screen
    currentMoles++;
}

/**
 * Function to end the game
 */
function endGame() {
    //Stop timer to stop moles spawn
    clearTimeout(timerId);
    timerId = null;

    //Fade the holes to .5 opacity then fade out and show results
    $("#holes").css("opacity", 0.5).fadeOut("slow", function () {
        $("#results").fadeIn("slow");
    });

    //Update results with stats
    $("#numRegular").text(numRegWhacked);
    $("#numSpecial").text(numSpecialWhacked);
    $("#numPoints").text(points);

    //Re-enable the start button
    $("#btnStart").prop("disabled", false);
}

/**
 * function to update point span
 */
function updatePointsDisplay() {
    $("#points").text(points);
}
