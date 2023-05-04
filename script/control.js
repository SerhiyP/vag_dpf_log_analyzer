window.table_on = 0;						//флаг отображения таблицы

//Поле выбор файла для анализа
function changeInputFile() {
  if (document.getElementById('file_name').val != '') {
    adGlobalVar();
    readFile();
  }
}


//Кнопка отобразить таблицу данных
function butTableView_On() {
  createTableResults();
  document.getElementById('result_table').style.display = 'block';
  table_on = 1;
}

//Кнопка убрать таблицу данных
function butTableView_Off() {
  document.getElementById('result_table').style.display = 'none';
  table_on = 0;
}


//Чек-боксы настройки графиков
function radioBut_XY(name) {
  let xAxis, yAxis, lableGraf;
  let valueX, valueY;
  let radiosX, radiosY;
  let id_result_graf, container;

  if (name == 'radioBut_X_1' || name == 'radioBut_Y_1') {
    radiosX = document.getElementsByName('radioBut_X_1');
    radiosY = document.getElementsByName('radioBut_Y_1');
    container = 'container1';
    id_result_graf = 'result_graf_1';
    lableGraf = 'График 1';
  } else if (name == 'radioBut_X_2' || name == 'radioBut_Y_2') {
    radiosX = document.getElementsByName('radioBut_X_2');
    radiosY = document.getElementsByName('radioBut_Y_2');
    container = 'container2';
    id_result_graf = 'result_graf_2';
    lableGraf = 'График 2';
  } else if (name == 'radioBut_X_3' || name == 'radioBut_Y_3') {
    radiosX = document.getElementsByName('radioBut_X_3');
    radiosY = document.getElementsByName('radioBut_Y_3');
    container = 'container3';
    id_result_graf = 'result_graf_3';
    lableGraf = 'График 3';
  }


  for (var i = 0, length = radiosX.length; i < length; i++) {
    if (radiosX[i].checked) {
      valueX = radiosX[i].value;
      break;
    }
  }

  for (var i = 0, length = radiosY.length; i < length; i++) {
    if (radiosY[i].checked) {
      valueY = radiosY[i].value;
      break;
    }
  }

  xAxis = logData[arrayHeader[Number(valueX)]];
  yAxis = logData[arrayHeader[Number(valueY)]];

  document.getElementById(id_result_graf).style.display = 'block';
  drawChartType5(xAxis, yAxis, arrayHeader[Number(valueX)], arrayHeader[Number(valueY)], lableGraf, container);
}





