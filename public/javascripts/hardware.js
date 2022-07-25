function hardwareSearch() {
    var search = document.getElementById('hardware-search').value.toLowerCase();
    let select = document.querySelector('#search-dropdown');
    let selectedOption = select.options[select.selectedIndex].text;

    // find search-dropdown selected.
    let tableElem = document.getElementsByClassName("personID");
    let tableElem1 = document.getElementsByClassName("make");
    let tableElem2 = document.getElementsByClassName("device");
    let tableElem3 = document.getElementsByClassName("serialNo");
    let tableRow = document.getElementsByClassName("tableRow");



    if (selectedOption == "PersonID") {

        for (let i = 0; i < tableElem.length; i++) {
            if (tableElem[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "Make") {

        for (let i = 0; i < tableElem1.length; i++) {
            if (tableElem1[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "Device") {

        for (let i = 0; i < tableElem2.length; i++) {
            if (tableElem2[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "Serial Number") {

        for (let i = 0; i < tableElem3.length; i++) {
            if (tableElem3[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    }  
}