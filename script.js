$(() => {
    const divCoins = $("#coins");
    let i = 0;
    let arrCoins2 = [];
    let selectedCoins = [];
    let modalIsOpen = false;
    let lastCoinId = null;
    $body = $("body");
    let arr2 = [];
    let isEqual;
    let isEqual2;

    function drowCoins1(coins) {
        for (const c of coins) {
            const divCard = $("<div></div>");
            const title = $("<h3></h3>");
            const nameC = $("<h6></h6>");
            const btnMI = $("<button></button>");
            const divItem = $("<div></div>");
            const imgC = $("<img></img>");
            const dolarC = $("<p></p>");
            const eroC = $("<p></p>");
            const shekelC = $("<p></p>");

            divCard.addClass("card p-1 m-2 rounded");
            title.addClass("card-title");
            nameC.addClass("card-subtitle mb-2 text-muted");
            btnMI.addClass("btn btnMI btn-outline-primary");
            btnMI.addClass('btnMI_' + c.id);

            divCard.html(`
        <div class="toggle">
        <label class="switch">
        <input type="checkbox" class="checbox_${c.id}" onchange="updateSelections('${c.id}', this.checked)">
        <span class="slider round"></span></div>
        `);

            title.text(c.symbol);
            nameC.text(c.name);
            btnMI.text("More Info");

            divCard.append(title);
            divCard.append(nameC);
            divCard.append(btnMI);
            divCard.append(divItem);

            divCoins.append(divCard);

            // מקבל את הפרטים של המטבע מהאייפיאי או מהלוקלסטורג' ומציג אותם
            function getDataById(coin) {
                divItem.addClass("card-text h5 p-2");
                imgC.addClass("imgC");

                dolarC.text("$" + coin.market_data.current_price.usd);
                eroC.html("&euro;" + coin.market_data.current_price.eur);
                shekelC.html("&#8362;" + coin.market_data.current_price.ils);
                imgC.attr("src", coin.image.small);

                divItem.empty();
                divItem.append(imgC);
                divItem.append(dolarC);
                divItem.append(eroC);
                divItem.append(shekelC);

            }

            // בעת לחיצה- שולף את הפרטים של כל מטבע לפי הID
            $(".btnMI_" + c.id).click(function () {
                // $(this).next().toggle();
                divItem.html(`
                <div class="spinner-border spinner"></div>
                `);
                let timeOut;

                if (!localStorage.getItem("id_" + c.id)) {
                    $.get("https://api.coingecko.com/api/v3/coins/" + c.id, coin => {
                        //  שומר בלוקל סטורג' את האובייקט של המטבע
                        localStorage.setItem("id_" + c.id, JSON.stringify(coin));
                        getDataById(coin);

                    })
                } else {
                    //    תציג את הפרטים שנשמרו בלוקלסטורג'
                    clearTimeout(timeOut);
                    const co = localStorage.getItem("id_" + c.id)
                    getDataById(JSON.parse(co));
                }
                // פונקציית טיימר שמוחקת אוטומטית את האובייקט שנכנס אחרי 2 דקות
                timeOut = setTimeout(() => {
                    localStorage.removeItem("id_" + c.id);
                }, 120000)
               
            });
        }
    }


    // קורא לפונקציה שתצייר למסך את המטבעות 
    function getCoins() {
        $('#coins').append('<div class="loader" id="loading"></div>')
        $.get('https://api.coingecko.com/api/v3/coins', coins => {
            drowCoins1(coins);

            $('#loading').hide();
            for (const c of coins) {
                arrCoins2.push(c);
            }
        })
    }

    getCoins();

    // בעת הקלדת חיפוש
    $("#btnSearch").on("click", () => {
        const filterCoins = arrCoins2.filter(res => res.symbol.toLowerCase() == $('#input1').val().toLowerCase());
        selectedCoins = [];
        if (filterCoins.length > 0) {

            $('#coins').empty();
            drowCoins1(filterCoins);
        }
        else {
            if ($('#input1').val()) {
                $('#coins').empty();
                $('#coins').html(`
                <h3>There are no results for your search 😐</h3>
                `)
            } else {
                selectedCoins = [];
                $('#coins').empty();
                drowCoins1(arrCoins2);
            }
        }
    });

    //   modal
    window.updateSelections = function (coinId, isChecked) {

        selectedCoins = jQuery.grep(selectedCoins, function (value) {
            return value != coinId;
        });

        if (!modalIsOpen && selectedCoins.length >= 5) {
            lastCoinId = coinId;
            //disable btn
            $('#saveBtn').prop('disabled', true);

            $('#formCoins').empty();
            for (const sc of selectedCoins) {
                const coin = $('<h4></h4>');
                const div = $('<div></div>');
                coin.addClass('coinToggle');
                div.addClass('divToggle');
                coin.html(`${sc}`);
                div.html(`
                         <div class="toggle">
                <label class="switch">
                <input type="checkbox" checked class="checbox_ ${sc}" onchange="updateSelections('${sc}', this.checked)">
                <span class="slider round"></span></div>
                `);
                $('#formCoins').append(coin);
                $('#formCoins').append(div);
            }
            $('#exampleModal').modal('show');
            modalIsOpen = true;
        }
        else {
            if (isChecked == true) {
                selectedCoins.push(coinId);
                if (selectedCoins.length >= 5) {
                    //disable btn
                    $('#saveBtn').prop('disabled', true);
                }
            } else {
                if (modalIsOpen) {
                    for (const co of arr2) {
                        if (co == coinId) {
                            isEqual = true;
                            break;
                        }
                    }
                    if (!isEqual && ($(".checbox_" + coinId).prop('checked', false))) {
                        arr2.push(coinId);
                    }
                }
                selectedCoins = jQuery.grep(selectedCoins, function (value) {
                    return value != coinId;
                });

                if (selectedCoins.length < 5) {//enable btn if > 5
                    $('#saveBtn').prop('disabled', false);
                }

            }

        }
        isEqual = false;
    }

    // שמירה במודל, מדליק את כל המטבעות שנבחרו
    window.saveCoin = function () {
        console.log("selectedCoins", selectedCoins)
        selectedCoins.push(lastCoinId);

        for (const co of arrCoins2) {
            $(".checbox_" + co.id).prop('checked', false);
        }

        for (const sc of selectedCoins) {
            $(".checbox_" + sc).prop('checked', true);
        }

        arr2 = [];
        $('#exampleModal').modal('hide');
        modalIsOpen = false;
    }

    window.closeModal = function () {

        for (const co of arr2) {
            for (const c2 of selectedCoins) {
                if (co == c2) {
                    isEqual2 = true;
                    break;
                }
            }
            if (!isEqual2) {
                $(".checbox_" + co).prop('checked', true);
                selectedCoins.push(co);
            }
            $(".checbox_" + co).prop('checked', true);
            isEqual2 = false;
        }

        $(".checbox_" + lastCoinId).prop('checked', false);
        selectedCoins = jQuery.grep(selectedCoins, function (value) {
            return value != lastCoinId;
        });
        arr2 = [];
        modalIsOpen = false;
    }

    // פונקציה של התפריט למעלה, מעבר בין הדפים
    window.navigataPages = function(evt, nameDive) {
        var i, tabbtns, navlinks, tabCont;
        // debugger;

        tabbtns = document.getElementsByClassName("tab-btn");
        tabCont = document.getElementsByClassName("tab-cont");

        for (i = 0; i < tabbtns.length; i++) {
            if (tabbtns[i].id == nameDive + '-btn') {
                tabbtns[i].className = "tab-btn btn bg-primary text-light";
                if (nameDive === 'parallax')
                    tabCont[i].className = "tab-cont tabcontent container-fluid";
                else
                    tabCont[i].className = "d-inline-flex flex-wrap tab-cont";
            } else {
                tabbtns[i].className = "tab-btn btn bg-light text-primary";
                tabCont[i].className = "d-none tab-cont";
            }
        }
    }


});

