//Глобальные переменные
function adGlobalVar() {
  window.arrayHeader = [];  					//массив с именами столбцов
  window.logData = {};						//многомерный ассоциативный массив с массивами данных
  window.headerTransformTime = 'Elapsed time (hr)'; //Имя заголовка столбца таблицы с прошедшим временем (ч)
}


//Функция чтения содержимого файла
function readFile() {
  //console.log("Чтение файла");
  let selectedFile = document.getElementById('inputFile').files[0];
  let reader = new FileReader;
  reader.onload = function (e) {
    let FileContent = e.target.result;
    parseContent(FileContent);

    generalInformation(FileContent);
    document.getElementById('file_name').innerHTML = document.getElementById('inputFile').files[0].name;
    document.getElementById('infoFile').style.display = 'block';

    createOptionsGraf();
    document.getElementById('optionsGraf').style.display = 'block';
    createСheckedOptionsGraf();

    if (table_on == 1) butTableView_On();

    radioBut_XY('radioBut_Y_1');
    radioBut_XY('radioBut_Y_2');
    radioBut_XY('radioBut_Y_3');
  };
  reader.readAsText(selectedFile, 'cp1251');
}


//Функция парсинга файла, сохранение данных в массивы
function parseContent(content) {
  //Парсинг последних заголовков таблицы в массив arrayHeader
  let stringHeader = content.match(/(Time\s\(ms\).+)/g);
  arrayHeader = stringHeader[stringHeader.length - 1].split(/\t/);
  arrayHeader.pop();

  //Парсинг строк таблиц данных
  let strArray = content.match(/(\d{13}[\d\t\.-]+)/g);

  //Создаем многомерный ассоциативный массив с массивами данных

  strArray.forEach((row) => {
    const tempArrayStrings = row.split(/\t/);
    const length = tempArrayStrings.length

    if(length !== 15) {
      return
    }

    if ([tempArrayStrings[length -2], tempArrayStrings[6], tempArrayStrings[9]].includes('')) {
      return
    }

    arrayHeader.forEach((col, i) => {
      const data = Number(tempArrayStrings[i])

      if (logData[col]) {
        logData[col].push(data)
      } else {
        logData[col] = [data]
      }
    })
  })
}

//Функция отображения общей иформации из файла
function generalInformation(content) {

  let div_ver_VAG_DPF = document.getElementById('ver_VAG_DPF');
  let div_log_save_date = document.getElementById('log_save_date');
  let div_log_time_ms = document.getElementById('log_time_ms');
  let div_log_distance_driven = document.getElementById('log_distance_driven');
  let div_log_oil_ash = document.getElementById('log_oil_ash');
  let div_log_last_soot_mass_calc = document.getElementById('log_last_soot_mass_calc');
  let div_filter_loading_with_soot = document.getElementById('filter_loading_with_soot');

  div_ver_VAG_DPF.innerHTML = '';
  div_log_save_date.innerHTML = '';
  div_log_time_ms.innerHTML = '';
  div_log_distance_driven.innerHTML = '';
  div_log_oil_ash.innerHTML = '';
  div_log_last_soot_mass_calc.innerHTML = '';
  div_filter_loading_with_soot.innerHTML = '';

  let tLength = logData['Time (ms)'].length;

  //Версия VAG DPF и Версия log-файла
  let ver = content.match(/Application Release: VAG DPF v\.([\d\.]{4,7})/g);
  let log_format = content.match(/Log\sFormat:\s([\d\.]{3,4})/g);
  div_ver_VAG_DPF.innerHTML = 'VAG DPF v.'
    + ver[ver.length - 1].match(/\d{1,2}\.\d{1,2}\.\d{1,2}/)
    + '&nbsp;&nbsp;&nbsp;&nbsp;'
    + 'Log Format: '
    + log_format[log_format.length - 1].match(/[\d\.]{3,4}/);

  //Дата первой и последней запси в log-файле
  let log_save_date = content.match(/Save\sdate\(yyyy-MM-dd\sHH:mm:ss\):\s[\d-\s:]{19}/g);
  let start_time = log_save_date[0].match(/20[\d-\s:]{17}/);
  let end_time = log_save_date[log_save_date.length - 1].match(/20[\d-\s:]{17}/);
  div_log_save_date.innerHTML = 'Дата первой и последней записи в файле: '
    + start_time
    + ' - '
    + end_time;

  //Разница времени первой и последней запси
  let delta_log_time_ms = logData['Time (ms)'][tLength - 1] - logData['Time (ms)'][0];
  let days = Math.floor(delta_log_time_ms / 3600000 / 24);
  let hours = Math.floor((delta_log_time_ms - days * 3600000 * 24) / 3600000);
  let minutes = Math.floor((delta_log_time_ms - days * 3600000 * 24 - hours * 3600000) / 60000);
  div_log_time_ms.innerHTML = 'Разница времени первой и последней запси: '
    + days
    + ' дней '
    + hours
    + ' ч '
    + minutes
    + ' мин';

  //Если в таблице есть данные по пробегу
  if ({}.hasOwnProperty.call(logData, 'Distance driven (km)')) {
    //Разница пробега
    let delta_log_distance_driven = logData['Distance driven (km)'][tLength - 1] - logData['Distance driven (km)'][0];
    div_log_distance_driven.innerHTML = 'Разница пробега в файле: '
      + logData['Distance driven (km)'][tLength - 1]
      + ' - '
      + logData['Distance driven (km)'][0]
      + ' = '
      + delta_log_distance_driven
      + ' км';

    //Разница масляная сажа
    let delta_log_oil_ash = logData['Oil Ash Residue (g)'][tLength - 1] - logData['Oil Ash Residue (g)'][0];
    delta_log_oil_ash = delta_log_oil_ash.toFixed(2);

    let oil_ash_on100km = delta_log_oil_ash / (delta_log_distance_driven / 1000);
    oil_ash_on100km = oil_ash_on100km.toFixed(3);

    div_log_oil_ash.innerHTML = 'Разница масляная зола в файле: '
      + logData['Oil Ash Residue (g)'][tLength - 1]
      + ' - '
      + logData['Oil Ash Residue (g)'][0]
      + ' = ' + delta_log_oil_ash
      + ' г'
      + ' ('
      + oil_ash_on100km
      + ' г на 1000 км)';
  } else {
    //Разница масляная сажа
    let delta_log_oil_ash = logData['Oil Ash Residue (g)'][tLength - 1] - logData['Oil Ash Residue (g)'][0];
    delta_log_oil_ash = delta_log_oil_ash.toFixed(2);
    div_log_oil_ash.innerHTML = 'Разница масляная зола в файле: '
      + logData['Oil Ash Residue (g)'][tLength - 1]
      + ' - '
      + logData['Oil Ash Residue (g)'][0]
      + ' = ' + delta_log_oil_ash
      + ' г';
  }


  //Последнее значение Вычисленной массы сажи
  let log_last_soot_mass_calc = logData['Soot Mass Calc. (g)'][tLength - 1];
  div_log_last_soot_mass_calc.innerHTML = 'Последнее значение вычисленной массы сажи: '
    + log_last_soot_mass_calc
    + ' г';

  div_filter_loading_with_soot.innerHTML = 'Заполнение фильтра сажей: '
    + (log_last_soot_mass_calc / 0.25).toFixed(1)
    + ' %';
}


////////////////Формирование таблицы данных ///////////////////////////
function createTableResults() {
  //console.log("Генерация таблицы");
  let table = '<table bgcolor=\'#E8E8E8\' border=\'1\' style=\'border-collapse:collapse;\'>';

  ///////Шапка таблицы//////
  table += '<tr align="center">';
  for (let i = 0; i < arrayHeader.length; i++) {
    table += '<td>' + arrayHeader[i] + '</td>';
  }
  table += '</tr>';

  ///////Тело таблицы//////
  for (let n = 0; n < logData['Time (ms)'].length; n++) {
    table += '<tr align="center">';
    for (let i = 0; i < arrayHeader.length; i++) {
      table += '<td>' + logData[arrayHeader[i]][n] + '</td>';
    }
    table += '</tr>';
  }

  table += '</table>';

  document.getElementById('data_table').innerHTML = table;
}


/////////Формирование поля управления графиками
function createOptionsGraf() {
  let table = '<table width=\'100%\'>'
    + '<tr align=\'center\'><td></td>'
    + '<td colspan=\'2\'>График 1</td>'
    + '<td colspan=\'2\'>График 2</td>'
    + '<td colspan=\'2\'>График 3</td></tr>'
    + '<tr align=\'center\'>'
    + '<td width=\'30%\'></td>'
    + '<td width=\'10%\'>Ось X</td>'
    + '<td width=\'10%\'>Ось Y</td>'
    + '<td width=\'10%\'>Ось X</td>'
    + '<td width=\'10%\'>Ось Y</td>'
    + '<td width=\'10%\'>Ось X</td>'
    + '<td width=\'10%\'>Ось Y</td></tr>';


  for (let i = 0; i < arrayHeader.length; i++) {
    table += '<tr align=\'center\' id=\''
      + arrayHeader[i]
      + '\'>'
      + '<td align=\'left\'>'
      + arrayHeader[i]
      + '</td>'
      + '<td><input type=\'radio\' class=\'radioBut_X_1\' name=\'radioBut_X_1\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '<td><input type=\'radio\' class=\'radioBut_Y_1\' name=\'radioBut_Y_1\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '<td><input type=\'radio\' class=\'radioBut_X_2\' name=\'radioBut_X_2\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '<td><input type=\'radio\' class=\'radioBut_Y_2\' name=\'radioBut_Y_2\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '<td><input type=\'radio\' class=\'radioBut_X_3\' name=\'radioBut_X_3\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '<td><input type=\'radio\' class=\'radioBut_Y_3\' name=\'radioBut_Y_3\' value=\'' + i + '\' onclick=\'radioBut_XY(this.name)\'/></td>'
      + '</tr>';
  }
  table += '</table>';

  document.getElementById('optionsGrafTable').innerHTML = table;
}


/////////Формирование checked в полях управления графиками
function createСheckedOptionsGraf() {
  let elem;

  if ({}.hasOwnProperty.call(logData, 'Distance driven (km)')) {
    elem = document.getElementById('Distance driven (km)');
    elem.getElementsByClassName('radioBut_X_1')[0].checked = true;
    elem.getElementsByClassName('radioBut_X_2')[0].checked = true;
    elem.getElementsByClassName('radioBut_X_3')[0].checked = true;
  } else {
    elem = document.getElementById('Time (ms)');
    elem.getElementsByClassName('radioBut_X_1')[0].checked = true;
    elem.getElementsByClassName('radioBut_X_2')[0].checked = true;
    elem.getElementsByClassName('radioBut_X_3')[0].checked = true;
  }

  elem = document.getElementById('Soot Mass Calc. (g)');
  elem.getElementsByClassName('radioBut_Y_1')[0].checked = true;

  elem = document.getElementById('DPF Surface Temp. (В°C)');
  elem.getElementsByClassName('radioBut_Y_2')[0].checked = true;

  elem = document.getElementById('Post injection 3 (mg/str)');
  elem.getElementsByClassName('radioBut_Y_3')[0].checked = true;
}


//Отображение графика библиотека highcharts.js
function drawChartType5(arrX, arrY, lableX, lableY, lableGraf, chartContainer) {
  //Оображение одного графика
  let arraySeries = [];

  for (let i = 0; i < arrX.length; i++) {
    let arrayBit = [arrX[i], arrY[i]];
    arraySeries.push(arrayBit);
  }

  //console.log("arraySeries: ", arraySeries);

  Highcharts.chart(chartContainer, {
    colors: ['#4F81BC', '#60B060'],
    chart: {
      zoomType: 'x',
    },
    title: {
      text: lableGraf,
      align: 'right',
      style: {'color': 'black', 'fontSize': '14px'},
      margin: 0
    },
    legend: {
      enabled: false
    },
    tooltip: {
      valueDecimals: 2
    },
    xAxis: {
      type: lableX === 'Time (ms)' ? 'datetime': 'linear',
      title: {
        text: lableX
      }
    },
    yAxis: [
      {
        maxPadding: 0.01,
        title: {
          text: lableY
        }
      }
    ],
    series: [
      {
        data: arraySeries,
        lineWidth: 1,
      }
    ]
  });
}



