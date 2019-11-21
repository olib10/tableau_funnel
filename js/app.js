'use strict';

(function () {
    $(document).ready(function () {
        tableau.extensions.initializeAsync({ 'configure': configure }).then(function () {
            drawChartJS();
            let unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
                drawChartJS();
            });
        }, function (err) { console.log('Error while Initializing: ' + err.toString()); });
    });

    function drawChartJS() {

        var worksheetName = tableau.extensions.settings.get("worksheet");
        var categoryColumnNumber = tableau.extensions.settings.get("categoryColumnNumber");
        var valueColumnNumber = tableau.extensions.settings.get("valueColumnNumber");

        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === worksheetName;
        });
        worksheet.getSummaryDataAsync().then(function (sumdata) {
            console.log(worksheet);
            var data = [];
            var worksheetData = sumdata.data;

            worksheetData.forEach(function (w) {
                data.push([w[categoryColumnNumber - 1].formattedValue, w[valueColumnNumber - 1].value]);
            })

            let chart = new D3Funnel("#myChart");
            let options = {
                chart: {
                    bottomWidth: 0.5,
                }, block: {
                    dynamicHeight: true,
                    highlight: true
                }, tooltip: {
                    enabled: true
                }
            }
            chart.draw(data, options);
        });
    }

    function configure() {
        const popupUrl = `${window.location.href}/dialog.html`;
        let defaultPayload = "";
        tableau.extensions.ui.displayDialogAsync(popupUrl, defaultPayload, { height: 300, width: 500 }).then((closePayload) => {
            drawChartJS();
        }).catch((error) => {
            switch (error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    console.log("Dialog was closed by user");
                    break;
                default:
                    console.error(error.message);
            }
        });
    }
})();
