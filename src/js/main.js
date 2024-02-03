class Queue {
    constructor() {
        this.requests = [];
    }

    add(request) {
        return this.requests.push(request);
    }

    remove() {
        if(this.requests.length > 0) {
            return this.requests.shift();
        }
    }

    front() {
        if(this.requests.length > 0) {
            return this.requests[0];
        }
    }

    isEmpty() {
        return this.requests.length == 0;
    }

    size() {
        return this.requests.length;
    }
}

const requestAddedEvent = new Event("requestAdded");
const liftIdleEvent = new Event("liftIdle");

function dispatchRequestAdded() {
    document.dispatchEvent(requestAddedEvent);
}

function dispatchLiftIdle() {
    document.dispatchEvent(liftIdleEvent);
}

document.addEventListener("requestAdded", () => {
    callLift();
});

document.addEventListener("liftIdle", () => {
    if(!requests.isEmpty()) {
        callLift();
    }
});

const floorsContainer = document.querySelector(".floors");
let floors = document.querySelectorAll(".floor");
let callButtons = document.querySelectorAll(".call-lift-btn");
let leftDoors = document.querySelectorAll(".left-door");
let rightDoors = document.querySelectorAll(".right-door");
var numFloors = 0;

let requests = new Queue();

const lifts = Array.from(document.querySelectorAll('.lift-container'), (element) => ({
    htmlElement: element,
    busy: false,
    currentFloor: 0,
}));

function getLifts() {
    return lifts;
}

function getClosestEmptyLift(destFloor) {
    const lifts = getLifts();

    var closestLiftIndex = -1;
    var closeLiftDistance = floors.length + 1;
    var closestLift = {};

    for(var i = 0; i < lifts.length; ++i) {
        if(!lifts[i].busy) {
            var distance = Math.abs(destFloor - lifts[i].currentFloor);
            if(distance < closeLiftDistance) {
                closestLiftIndex = i;
                closeLiftDistance = distance;
                closestLift = lifts[i];
            }
        }
    }

    return { lift: closestLift, index: closestLiftIndex};
}

function openLift(liftNum) {
    leftDoors = document.querySelectorAll(".left-door");
    rightDoors = document.querySelectorAll(".right-door");

    rightDoors[liftNum].classList.add("right-door-open");
    leftDoors[liftNum].classList.add("left-door-open");
    leftDoors[liftNum].classList.remove("left-door-close");
    rightDoors[liftNum].classList.remove("right-door-close");
}

function closeLift(liftNum) {
    leftDoors = document.querySelectorAll(".left-door");
    rightDoors = document.querySelectorAll(".right-door");

    rightDoors[liftNum].classList.remove("right-door-open");
    leftDoors[liftNum].classList.remove("left-door-open");
    leftDoors[liftNum].classList.add("left-door-close");
    rightDoors[liftNum].classList.add("right-door-close");

    setTimeout(() => {
        lifts[liftNum].busy = false;
        dispatchLiftIdle();
    }, 2500);
}

function openCloseLift(liftNum) {
    openLift(liftNum);
    setTimeout(() => {
        closeLift(liftNum);
    }, 3000);
}

function moveLift(lift, destFloor, index) {
    const distance = Math.abs(destFloor - lifts[index].currentFloor);
    lift.style.transform = `translateY(${destFloor * 100 * -1}%)`;
    lift.style.transition = `transform ${2000 * distance}ms ease-in-out`;
    lifts[index].currentFloor = destFloor;
    
    setTimeout(() => {
        openCloseLift(index);
    }, 2000 * distance);
}

function callLift() {
    const { lift, index } = getClosestEmptyLift(requests.front()); 

    if(index >= 0) {
        lifts[index].busy = true;
        moveLift(lift.htmlElement, requests.remove(), index);
    }
}

function getLiftElement() {
    const liftDistance = (lifts.length + 1) * 120;

    const liftElement = document.createElement("div");
    liftElement.classList.add("lift-container");
    liftElement.style.position = "absolute";
    liftElement.style.left = `${liftDistance}px`;

    liftElement.innerHTML += `
            <div class="left-door">                        
            </div>
            <div class="right-door">
            </div>
    `;

    return liftElement;
}

function addLift() {
    floors = document.querySelectorAll(".floor");
    floors[floors.length - 1].append(getLiftElement());
    var liftElements = document.querySelectorAll('.lift-container');
    lifts.push({
        htmlElement: liftElements[liftElements.length - 1],
        busy: false,
        currentFloor: 0,
    });
}

function getFloorElement(floorNumber) {
    const floorElement = document.createElement("div");
    floorElement.classList.add("floor");
    floorElement.innerHTML += `
        <div class="lift-buttons">
            <button class="call-lift-btn call-lift-up-btn" data-lift-num="${floorNumber}">
                >
            </button>
            <button class="call-lift-btn call-lift-down-btn" data-lift-num="${floorNumber}">
                >
            </button>
        </div>
    `;

    return floorElement;
}

function addRequest(destFloor) {
    requests.add(destFloor);
    dispatchRequestAdded();
}

function addCallEventListeners(buttons) {
    for(let i = 0; i < buttons.length; ++i) {
        let destFloor = buttons[i].dataset.liftNum;
        buttons[i].addEventListener("click", () => {
            addRequest(destFloor);
        });
    }
}

function removeFirstLastFloorButtons() {
    var floors = document.querySelectorAll('.floor');
    for(var floorNum = 0; floorNum < numFloors; ++floorNum) {
        var floor = floors[floorNum];
        if(floor.childNodes[1].childNodes[1].dataset.liftNum == (numFloors - 1))
            floor.childNodes[1].childNodes[1].style.display = 'none'
        else if(floor.childNodes[1].childNodes[3].dataset.liftNum == 0)
            floor.childNodes[1].childNodes[3].style.display = 'none';
    }
}

function takeInputAndStartSimulation() {
    const numLifts = parseInt(document.getElementById('num-lifts').value);
    numFloors = parseInt(document.getElementById('num-floors').value);

    document.getElementById('start-button').style.display = 'none';
    document.getElementById('num-lifts').setAttribute('disabled', 'disabled');
    document.getElementById('num-floors').setAttribute('disabled', 'disabled');

    for(var floor = 1; floor < numFloors; ++floor) {
        floorsContainer.prepend(getFloorElement(floor));
    }

    for(var lift = 0; lift < numLifts; ++lift) {
        addLift();
    }

    removeFirstLastFloorButtons();
    callButtons = document.querySelectorAll(".call-lift-btn");
    addCallEventListeners(callButtons);
}

function addEventListeners() {
    document.getElementById('start-simulation').addEventListener('click', takeInputAndStartSimulation);
}

function main() {
    addEventListeners();
}

main();