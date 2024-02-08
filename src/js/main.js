class Queue {
    constructor() {
        this.requests = [];
        this.processingRequests = [];
    }

    add(request) {
        return this.requests.push(request);
    }

    remove() {
        if(this.requests.length > 0) {
            const removedElement = this.requests.shift();
            this.processingRequests.push(removedElement);
            return removedElement;
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

    removeProcessing(element) {
        if(this.processingRequests.length > 0) {
            const index = this.processingRequests.findIndex((ele) => element == ele);
            if(index != -1) {
                this.processingRequests.splice(index, 1);
            }
        }
    }

    find(element) {
        if(this.requests.findIndex((ele) => ele == element) != -1 || this.processingRequests.findIndex((ele) => ele == element) != -1)
            return true;
        return false;
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
let callUpButtons = document.querySelectorAll(".call-lift-up-btn");
let callDownButtons = document.querySelectorAll(".call-lift-down-btn");
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
    const length = destFloor.length;
    const destFloorNumber = destFloor.substring(0, length - 1);

    var closestLiftIndex = -1;
    var closeLiftDistance = floors.length + 1;
    var closestLift = {};

    for(var i = 0; i < lifts.length; ++i) {
        if(!lifts[i].busy) {
            var distance = Math.abs(destFloorNumber - lifts[i].currentFloor);
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

function closeLift(liftNum, destFloor) {
    leftDoors = document.querySelectorAll(".left-door");
    rightDoors = document.querySelectorAll(".right-door");

    rightDoors[liftNum].classList.remove("right-door-open");
    leftDoors[liftNum].classList.remove("left-door-open");
    leftDoors[liftNum].classList.add("left-door-close");
    rightDoors[liftNum].classList.add("right-door-close");

    setTimeout(() => {
        lifts[liftNum].busy = false;
        requests.removeProcessing(destFloor);
        dispatchLiftIdle();
    }, 2500);
}

function openCloseLift(liftNum, destFloor) {
    openLift(liftNum);
    setTimeout(() => {
        closeLift(liftNum, destFloor);
    }, 3000);
}

function moveLift(lift, destFloor, index) {
    const length = destFloor.length;
    const destFloorNumber = destFloor.substring(0, length - 1);
    const distance = Math.abs(destFloorNumber - lifts[index].currentFloor);
    lift.style.transform = `translateY(${destFloorNumber * 100 * -1}%)`;
    lift.style.transition = `transform ${2000 * distance}ms ease-in-out`;
    lifts[index].currentFloor = destFloorNumber;
    
    setTimeout(() => {
        openCloseLift(index, destFloor);
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
        <div class="floor-number">
            FLOOR ${floorNumber}
        </div>
    `;

    return floorElement;
}

function addRequest(destFloor) {
    if(!requests.find(destFloor)) {
        requests.add(destFloor);
        dispatchRequestAdded();
    }
}

function addCallEventListeners(buttons, direction) {
    for(let i = 0; i < buttons.length; ++i) {
        let destFloor = buttons[i].dataset.liftNum;
        buttons[i].addEventListener("click", () => {
            addRequest(destFloor + direction);
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

function addResetHandler() {
    const simulateButton = document.getElementById('start-simulation');
    simulateButton.textContent = 'Reset';
    simulateButton.addEventListener("click", () => {
        location.reload();
    });
}

function takeInputAndStartSimulation() {
    const numLifts = parseInt(document.getElementById('num-lifts').value);
    numFloors = parseInt(document.getElementById('num-floors').value);

    if(isNaN(numLifts) || numLifts <= 0 || isNaN(numFloors) || numFloors <= 0) {
        alert('Entered input is invalid, please check');
        document.getElementById('num-lifts').value = '';
        document.getElementById('num-floors').value = '';
        return;
    }

    addResetHandler();
    document.getElementById('num-lifts').setAttribute('disabled', 'disabled');
    document.getElementById('num-floors').setAttribute('disabled', 'disabled');

    for(var floor = 0; floor < numFloors; ++floor) {
        floorsContainer.prepend(getFloorElement(floor));
    }

    for(var lift = 0; lift < numLifts; ++lift) {
        addLift();
    }

    var line = document.querySelector('.lift-container:last-child').style.left;
    var lineLength = parseInt(line.substring(0, line.length - 2));

    var floors = document.querySelectorAll('.floor');
    for(var i = 0; i < floors.length; ++i) {
        floors[i].style.width = `${lineLength + 80}px`;
    }

    removeFirstLastFloorButtons();
    callUpButtons = document.querySelectorAll(".call-lift-up-btn");
    addCallEventListeners(callUpButtons, 'U');
    callDownButtons = document.querySelectorAll(".call-lift-down-btn");
    addCallEventListeners(callDownButtons, 'D');
}

function addEventListeners() {
    document.getElementById('start-simulation').addEventListener('click', takeInputAndStartSimulation);
}

function main() {
    addEventListeners();
}

main();