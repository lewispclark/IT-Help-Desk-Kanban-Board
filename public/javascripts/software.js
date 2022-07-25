function softwareSearch() {
    var search = document.getElementById('software-search').value.toLowerCase();
    let select = document.querySelector('#search-dropdown');
    let selectedOption = select.options[select.selectedIndex].text;

    // find search-dropdown selected.
    let tableElem = document.getElementsByClassName("ID");
    let tableElem1 = document.getElementsByClassName("SoftwareName");
    let tableElem2 = document.getElementsByClassName("SoftwareVersion");
    let tableElem3 = document.getElementsByClassName("LicenseNumber");
    let tableElem4 = document.getElementsByClassName("PersonID");
    let tableRow = document.getElementsByClassName("tableRow");


    if (selectedOption == "ID") {
        for (let i = 0; i < tableElem.length; i++) {
            if (tableElem[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "Name") {

        for (let i = 0; i < tableElem1.length; i++) {
            if (tableElem1[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "Version") {

        for (let i = 0; i < tableElem2.length; i++) {
            if (tableElem2[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    } else if (selectedOption == "License Number") {

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
    else if (selectedOption == "Person ID") {

        for (let i = 0; i < tableElem4.length; i++) {
            if (tableElem4[i].innerHTML.toLowerCase().includes(search)) {
                tableRow[i].style.display = "";
            } else if (search == "") {
                tableRow[i].style.display = "";
            } else {
                tableRow[i].style.display = "None";
            }
        }
    }  
}