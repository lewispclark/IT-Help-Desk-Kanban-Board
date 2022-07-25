// When document is ready
docReady(() => {
    // Stop comment from submitting form on enter
    let comment = document.querySelector('#comment');
    comment.addEventListener('keydown', event => {
        commentCheck(event);
    });

    // Remove disabled attribute from all inputs when form is submitted
    // For each form
    let createForm = document.querySelector('#create-form');
    createForm.addEventListener('submit', () => {
        if (checkCreateForm(false)) {
            let disabled = document.querySelectorAll(':disabled');
            disabled.forEach(input => {
                input.disabled = false;
            });
        }
    });
    let updateForm = document.querySelector('#update-form');
    updateForm.addEventListener('submit', () => {
        if (checkUpdateForm(false)) {
            let disabled = document.querySelectorAll(':disabled');
            disabled.forEach(input => {
                input.disabled = false;
            });
        }
    });

});

/**
 * Checks that the inputs on the create-form do not contain injection scripts
 * 
 * @returns true if inputs are valid, false otherwise
 */
function checkCreateForm(showAlert) {
    // Check all inputs for illegal characters
    let form = document.forms["create-form"];
    let valid = true;
    ["ticketDescription", "newCreateTypeText"].forEach(input => {
        if (!validateCharacters(form[input].value)) {
            if (showAlert) {
                alertBanner('ERROR: Illegal character(s) entered in input field.');
                closeModal();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // For each disabled input
            document.querySelector('#problemID').disabled = true;
            valid = false;
            return;
        }
    });
    return valid;
}

/**
 * Checks that the inputs on the update-form do not contain injection scripts
 * 
 * @returns true if inputs are valid, false otherwise
 */
function checkUpdateForm(showAlert) {
    // Check all inputs for illegal characters
    let form = document.forms["update-form"];
    let valid = true;
    ["viewTicketDescription", "newTypeText", "newSolutionText"].forEach(input => {
        if (!validateCharacters(form[input].value)) {
            if (showAlert) {
                alertBanner('ERROR: Illegal character(s) entered in input field.');
                closeModal();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            // For each disabled input
            ['#viewResolvedTimestamp', '#viewCreatedTimestamp', '#viewID'].forEach(input => {
                document.querySelector(input).disabled = true;
            });
            valid = false;
            return;
        }
    });
    return valid;
}

/**
 * Check if characters in string are valid and aren't used for script injection
 * 
 * @param {String} string to check characters of 
 * @returns true if string is valid, false otherwise
 */
const validateCharacters = string => !string.match(/[|&;$%@"<>()+]/g);

/**
 * If user presses enter in comment form, add comment but don't update ticket
 * 
 * @param {Event} event 
 * @returns 
 */
function commentCheck(event) {
    if (event.key == 'Enter') {
        event.preventDefault();
        addComment();
        return false;
    }
}

/**
 * Add a comment to the ticket that is being viewed by the user
 */
function addComment() {
    let ticketID = document.querySelector('#viewID').value;
    // If nothing is entered into input, return
    let comment = document.querySelector('#comment');
    console.log(comment.value);
    console.log(validateCharacters(comment.value));
    if (!comment.value) return;
    // Check if user has attempted to inject code
    else if (!validateCharacters(comment.value)) {
        alertBanner('ERROR: Illegal character(s) entered in input field.');
        closeModal();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    }

    // Ajax request to add comment to ticket
    ajax.post('./ajax-callable-functions', { functionname: 'addComment', arguments: JSON.stringify({ userid: userid, ticketID: ticketID, Text: comment.value }) }, obj => {
        let log = JSON.parse(obj);
        // Create comment item
        let output = '<span class="log-user">' + log.OriginPersonnel + '</span> commented: ' + log.Text;
        let newLog = document.createElement('li');
        // Add new comment to logbox
        newLog.classList.add('ticket-log');
        newLog.innerHTML = output + '<p class="log-timestamp">' + log.LogTimestamp + '</p>';
        // Insert comment as first element in logbox
        let logbox = document.querySelector('#logbox');
        logbox.insertBefore(newLog, logbox.firstChild);
    });

    // Empty comment box
    comment.value = '';
}

// Remove all logs from logbox
function removeTicketLogs() {
    let ticketLogList = document.querySelector('#logbox');
    ticketLogList.innerHTML = '';
}

/**
 * Get logs for ticket and add to log box
 * 
 * @param {Number} ticketID  Unique ID of ticket
 */
function getTicketLogs(ticketID) {
    // Ajax request to get ticket logs from database
    ajax.post('./ajax-callable-functions', { functionname: 'getTicketLogs', arguments: JSON.stringify({ ticketID: ticketID }) }, obj => {
        result = JSON.parse(obj);
        let logs = [];
        // For each log
        result.forEach(log => {
            // Create structure for log format based on log type
            let output = '<span class="log-user">' + log.OriginPersonnel + '</span>';
            switch (log.LogType) {
                case "Create":
                    output += " created the ticket";
                    break;
                case "Unassign":
                    output += " unnassigned " + log.Text;
                    break;
                case "Comment":
                    output += " commented: " + log.Text;
                    break;
                case "UpdateState":
                    output += " updated state to: " + log.Text;
                    break;
                case "UpdateSpecialist":
                    output += (log.AssignedPersonnel ? " updated specialist to: " + '<span class="log-user">' + log.AssignedPersonnel + '</span>' : " unassigned specialist")
                    break;
                case "UpdatePriority":
                    output += " updated priority to: " + log.Text;
                    break;
                case "UpdateDescription":
                    output += " updated description.";
                    break;
                case "UpdateProblemType":
                    output += " updated problem type to: " + log.Text;
                    break;
                case "UpdateSoftware":
                    output += " updated software to: " + (log.Text ? log.Text : "unassigned");
                    break;
                case "UpdateHardware":
                    output += " updated hardware to: " + (log.Text ? log.Text : "unassigned");
                    break;
                case "UpdateReporter":
                    output += (log.AssignedPersonnel ? " updated reporter to: " + '<span class="log-user">' + log.AssignedPersonnel + '</span>' : " unassigned reporter")
                    break;
                case "AddSolution":
                    output += " updated solution to: " + (log.Text ? log.Text : "unassigned");
                    break;
            }
            // Add log as an item in logbox list
            let newLog = document.createElement('li');
            newLog.classList.add('ticket-log');
            newLog.innerHTML = output + '<p class="log-timestamp">' + log.LogTimestamp + '</p>';
            console.log(output);
            logs.push(newLog)
        });
        // Remove all logs from logbox
        removeTicketLogs();
        let logbox = document.querySelector('#logbox');
        // Put all new logs in logbox
        logs.forEach(log => {
            logbox.appendChild(log);
        });
    });
};

// Get ticket modals
var createTicketModal = document.getElementById("create-ticket-modal");
var viewTicketModal = document.getElementById("view-ticket-modal");

// Close ticket modals when close button is clicked
function closeModal() {
    createTicketModal.style.display = "none";
    viewTicketModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = (event) => {
    if (event.target.className == "modal fade" || event.target.className == "modal-form") {
        createTicketModal.style.display = "none";
        viewTicketModal.style.display = "none";
    }
}

// When user presses "ESC" on keyboard, close modal
window.onkeydown = (event) => {
    if (event.key == "Escape" && (createTicketModal.style.display == "block" || viewTicketModal.style.display == "block")) {
        createTicketModal.style.display = "none";
        viewTicketModal.style.display = "none";
    }
};

/* 
 * Prepare form on modal for user to enter values to create ticket
 */
function createTicket() {
    // When the user clicks on the button, open the modal
    createTicketModal.style.display = "block";

    // Hide new type column
    let newCreateTypeCol = document.querySelector('.newCreateTypeCol');
    newCreateTypeCol.style.display = 'none';

    // Hide new create external specialist column
    let newCreateExternalSpecialistCol = document.querySelector('.newCreateExternalSpecialistCol');
    newCreateExternalSpecialistCol.style.display = 'none';
}


/**
 * If user has selected "External" in the type select, allow user to add new external specialist
 * to the database and use it for the ticket
 * 
 * @param {Event} event select that is used to select external 
 */
function addExternalSpecialist(event) {
    let newExternalSpecialist = document.querySelector('.newExternalSpecialistCol');
    // If value is changed to -1
    if (event.value == -1) {
        // Show new solution column
        newExternalSpecialist.style.display = 'contents';
    } else {
        // Hide new solution column
        newExternalSpecialist.style.display = 'none';
    }
}

/**
 * If user has selected "External" in the type select, allow user to add new external specialist
 * to the database and use it for the ticket
 * 
 * @param {Event} event select that is used to select external 
 */
function addCreateExternalSpecialist(event) {
    let newCreateExternalSpecialist = document.querySelector('.newCreateExternalSpecialistCol');
    // If value is changed to -1
    if (event.value == -1) {
        // Show new solution column
        newCreateExternalSpecialist.style.display = 'contents';
    } else {
        // Hide new solution column
        newCreateExternalSpecialist.style.display = 'none';
    }
}

/**
 * If user has selected "New" in the type select, allow user to add new type
 * to the database and use it for the ticket
 * 
 * @param {Event} event select that is used to select type 
 */
function addNewCreateType(event) {
    let newCreateTypeCol = document.querySelector('.newCreateTypeCol');
    // If value is changed to -1
    if (event.value == -1) {
        // Show new solution column
        newCreateTypeCol.style.display = 'block';
    } else {
        // Hide new solution column
        newCreateTypeCol.style.display = 'none';
    }
}

/**
 * If user has selected "New" in the type select, allow user to add new type
 * to the database and use it for the ticket
 * 
 * @param {Event} event select that is used to select type
 */
function addNewType(event) {
    let newTypeCol = document.querySelector('.newTypeCol');
    // If value is changed to -1
    if (event.value == -1) {
        // Show new solution column
        newTypeCol.style.display = 'block';
    } else {
        // Hide new solution column
        newTypeCol.style.display = 'none';
    }
}

/**
 * If user has selected "New" in the solution select, allow user to add new solution
 * to the database and use it for the ticket
 * 
 * @param {Event} event select that is used to choose solution
 */
function addNewSolution(event) {
    let newCreateTypeCol = document.querySelector('.newSolutionCol');
    // If value is changed to -1
    if (event.value == -1) {
        // Show new solution column
        newCreateTypeCol.style.display = 'block';
    } else {
        // Hide new solution column
        newCreateTypeCol.style.display = 'none';
    }
}

/**
 * Get the phone number of the personnel selected by the user and display
 * 
 * @param {HTML Element} element select that contains personnel
 */
function getPhoneNo(element) {
    // Get phone number label
    let label = element.nextElementSibling;
    // Ajax request to get phone number from database
    ajax.post('./ajax-callable-functions', { functionname: 'getPhoneNo', arguments: JSON.stringify({ personnelID: element.value }) }, obj => {
        if (obj) {
            label.textContent = JSON.parse(obj).PhoneNo;
        } else {
            label.textContent = '';
        }
    });
}

/**
 * Show ticket modal when ticket card is clicked
 * 
 * @param {Number} ticketID  Unique ID of ticket
 */
function showTicket(ticketID) {
    // Hide new solution column
    let newSolutionCol = document.querySelector('.newSolutionCol');
    newSolutionCol.style.display = 'none';

    // Clear comment text input
    let comment = document.querySelector('#comment');
    comment.value = '';

    // Hide new type column
    let newCreateTypeCol = document.querySelector('.newCreateTypeCol');
    newCreateTypeCol.style.display = 'none';

    // Hide new external specialist column
    let newExternalSpecialistCol = document.querySelector('.newExternalSpecialistCol');
    newExternalSpecialistCol.style.display = 'none';

    // Hide new create external specialist column
    let newCreateExternalSpecialistCol = document.querySelector('.newCreateExternalSpecialistCol');
    newCreateExternalSpecialistCol.style.display = 'none';

    // Stop comment from submitting form on enter
    comment.addEventListener('onkeydown', event => {
        event.preventDefault();
        addComment();
        return false;
    });

    // Show view ticket modal
    viewTicketModal.style.display = "block";

    // Remove all logs from logbox
    removeTicketLogs();

    // Ajax request to get ticket details from database
    ajax.post('./ajax-callable-functions', { functionname: 'getTicketDetails', arguments: JSON.stringify({ ticketID: ticketID }) }, obj => {
        result = JSON.parse(obj);
        console.log(result)
        Object.keys(result).forEach(key => {
            // If object key corresponds to a dropdown menu and values haven't been set
            let input = document.querySelector('#view' + key);
            if (["SoftwareID", "HardwareID", "SolutionID", "AssignedSpecialistID", "FinalSolutionID"].includes(key) && !result[key]) {
                // Set to defaults
                input.value = 0;
                // If object key corresponds to a personnel dropdown
            } else if (["ReporterNo", "SpecialistNo"].includes(key)) {
                // Set text to result
                input.textContent = result[key];
            } else {
                // Set value to result
                input.value = result[key];
            }
        });
        getTicketLogs(ticketID);
    });
};

/**
 * Only show tickets that are assigned to the user
 * 
 * @param {Event} event 
 */
function onlyShowAssigned(event) {
    // Get all tickets
    let tickets = document.querySelectorAll('.ticket');
    // Display all tickets
    if (!event.checked) {
        tickets.forEach(ticket => {
            ticket.style.display = 'list-item';
        });
        return false;
    }
    // Loop through tickets
    tickets.forEach(ticket => {
        // If ticket is not assigned to user
        if (ticket.dataset.assignedspecialistid != userid && ticket.dataset.reporterid != userid) {
            ticket.style.display = 'none';
        } else {
            ticket.style.display = 'list-item';
        }
    });
};

/**
 * Group tickets by problem type
 * 
 * @param {Event} event 
 */
function groupByProblemTypes(event) {
    // Ajax query to set groupByProblemTypes to false
    ajax.post('./ajax-callable-functions', { functionname: 'setGroupByProblemTypes', arguments: JSON.stringify({ checked: event.checked }) }, obj => {
        location.reload();
    });
};

// When searchbar is focused and key is pressed
function ticketSearch() {
    let search = document.querySelector('#ticket-search').value.toLowerCase();
    let select = document.querySelector('#search-dropdown');
    let selectedOption = select.options[select.selectedIndex].text;
    // Check if "only show assigned" is checked
    let assignedOnly = document.querySelector('#onlyShowAssigned').checked;

    // Get all tickets
    let tickets = document.querySelectorAll('.ticket');
    // If search is empty
    if (search == '') {
        // Redisplay all tickets
        tickets.forEach(ticket => {
            // If only show assigned is checked and user is not assigned to ticket
            if (assignedOnly && ticket.dataset.assignedspecialistid == userid) {
                // Hide ticket
                ticket.style.display = 'none';
            } else {
                // Display ticket
                ticket.style.display = 'list-item';
            }
        });
        return false;
    }

    // Loop through tickets
    tickets.forEach(ticket => {
        // If ticket field does not contain search
        if (!ticket.dataset[selectedOption.toLowerCase()]
            || assignedOnly && ticket.dataset.assignedspecialistid != userid
            || ticket.dataset[selectedOption.toLowerCase()].toString().toLowerCase().indexOf(search) == -1) {
            // Hide ticket
            ticket.style.display = 'none';
        } else {
            if (assignedOnly && ticket.dataset.assignedspecialistid == userid)
                // Display ticket
                ticket.style.display = 'list-item';
        }
    });
}

/**
 * Sets target data when user starts dragging ticket card
 * 
 * @param {Event} event Event for when user starts dragging ticket card
 */
function onDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.id);
}

/**
 * Prevent browser default actions for when a HTML element is dragged
 * 
 * @param {Event} event Event for when user drags ticket card 
 */
function onDragOver(event) {
    event.preventDefault();
    // Convert event target to correct dropzone
    let dropzone = event.target;
    // If dropzone is table cell
    if (dropzone.tagName == "TD") {
        // Convert dropzone to first child of table cell
        dropzone = dropzone.firstElementChild;
    }
    // While dropzone is not an unordered list (the destination column)
    while (dropzone.tagName != "UL") {
        // Convert dropzone to its parent node
        dropzone = dropzone.parentNode;
    }
}

/**
 * Validate whether ticket move is valid and move ticket to new column, updating ticket state
 * in the database
 * 
 * @param {Event} event Event for when the user drops a ticket card 
 */
function onDrop(event) {
    // If Firefox 1.0+
    if (typeof window["InstallTrigger"] !== 'undefined') {
        alert("Error: Your browser does not support drag and drop.");
        return false;
    }
    if (event.preventDefault) { event.preventDefault(); }
    if (event.stopPropagation) { event.stopPropagation(); }
    // Get ticket ID
    const id = event.dataTransfer.getData('text');
    const draggableElement = document.getElementById(id);

    // Convert event target to correct dropzone
    let dropzone = event.target;
    // If dropzone is table cell
    if (dropzone.tagName == "TD") {
        // Convert dropzone to first child of table cell
        dropzone = dropzone.firstElementChild;
    }
    // While dropzone is not an unordered list (the destination column)
    while (dropzone.tagName != "UL") {
        // Convert dropzone to its parent node
        dropzone = dropzone.parentNode;
    }

    console.log(dropzone);

    // Clear event data
    event.dataTransfer.clearData();

    // Ajax request for getting ticket details
    let ticketID = id.replace('ticket', '');
    console.log(ticketID)
    ajax.post('./ajax-callable-functions', { functionname: 'getTicketDetails', arguments: JSON.stringify({ ticketID: ticketID }) }, obj => {
        // Reload ticket table
        let ticketDetails = JSON.parse(obj);
        // If ticket has not been moved
        console.log(dropzone.dataset)
        console.log(ticketDetails)
        if ((!dropzone.dataset.typeid || dropzone.dataset.typeid == ticketDetails.TypeID) && dropzone.dataset.state == ticketDetails.TicketState) {
            return false;
        }
        // Problem type has been changed
        if (dropzone.dataset.typeid && dropzone.dataset.typeid != ticketDetails.TypeID) {
            console.log("Type ID updated");
            ajax.post('./ajax-callable-functions', { functionname: 'updateTicketType', arguments: JSON.stringify({ ticketID: ticketID, typeID: dropzone.dataset.typeid }) }, obj => {
                console.log(obj);
            });
        }
        // Ticket state has not been changed
        if (dropzone.dataset.state == ticketDetails.TicketState) {
            dropzone.appendChild(draggableElement);
        }
        // If ticket is not assigned and destination state is not "TODO"
        else if (!ticketDetails.AssignedSpecialistID && dropzone.dataset.state != 'TODO') {
            // Display error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alertBanner("ERROR: Ticket must have specialist assigned to move to \"IN PROGRESS\", \"IN REVIEW\" or \"RESOLVED\" columns", "danger");
            return;
            // If ticket has no solution and destination state is "INREVIEW" or "RESOLVED"
        } else if (!ticketDetails["FinalSolutionID"] && ["INREVIEW", "RESOLVED"].includes(dropzone.dataset.state)) {
            // Display error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alertBanner("ERROR: Ticket must have solution to move to \"IN REVIEW\" or \"RESOLVED\" columns", "danger");
            return;
        }
        // If destination column is "RESOLVED"
        if (dropzone.dataset.state == "RESOLVED") {
            // Ajax query to set resolved time on ticket
            ajax.post('./ajax-callable-functions', { functionname: 'setTicketResolvedDate', arguments: JSON.stringify({ ticketID: ticketID }) }, obj => {
                console.log(obj);
            });
            // Reload table
            dropzone.appendChild(draggableElement);
        }
        else {
            // Ajax query to remove resolved time on ticket
            ajax.post('./ajax-callable-functions', { functionname: 'removeTicketResolvedDate', arguments: JSON.stringify({ ticketID: ticketID }) }, obj => {
                console.log(obj);
            });
        }
        // Ajax query to to update ticket state
        if(dropzone.dataset.state != ticketDetails.TicketState){
            console.log("Ticket state updated " + dropzone.dataset.state);
            ajax.post('./ajax-callable-functions', { functionname: 'updateTicketState', arguments: JSON.stringify({ ticketID: ticketID, ticketState: dropzone.dataset.state }) }, obj => {
                console.log(obj);
            });
        }
        // Reload table
        dropzone.appendChild(draggableElement);
    });
}