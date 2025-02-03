class UpdateAdressesOverdue {
  constructor() {
    //встановлюємо данні для обчислення
    this.today = new Date();
    this.diffRound = (1000 * 60 * 60 * 24);
    this.overdueDays = 120;

    //ініціюємо змінні для даних з таблиці
    this.data = [];
    this.sheet = {};
    this.headers = [];

    //встановлюємо дані з таблиці
    this._initiationSheet();

    //ініціюємо дати та колинки в які встановити що вони прострочені
    this.lastTaken = '';
    this.lastPassen = '';
    this.lastTakenCol = 0;
  }

  _initiationSheet() {
    this.sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    this.data = this.sheet.getDataRange().getValues();

    //беремо одразу другу строку заголовків
    this.headers = this.data[1];
  }

  _clearSheetPrevious() {
    this.sheet.getRange("A3:Z500").setBackground(null);
  }

  _clearRowPrevious(row) {
    this.sheet.getRange(`A${row}:Z${row}`).setBackground(null);
  }

  highlightOverdueOnEdit(e) {
    //отримуємо діапазон зміненої комірки та номер 
    let range = e.range; 
    let row = range.getRow(); 
    
    if(row > 2) {
      // очищуємо строку від попередніх значень
      this._clearRowPrevious(row);

      // Отримуємо всю строку, в якій відбулося редагування
      let line = this.sheet.getRange(row, 1, 1, this.sheet.getLastColumn()).getValues()[0];

      //встановлюємо де є 'Консьерж' світло жовтий колір
      this.setBackgroundConcierge(row, line);

      //ініціюємо змінні для останніх встановлених дат
      this.setLastDates(line);

      //перевіряємо чи є "просрочка" по датам і якщо так змінюємо колір потрібній строчці чи комірці
      this.isOverdueLastDates(row)
    }
  }

  highlightOverdueDaily() {

    // очищуємо сторінку від попередніх значень
    this._clearSheetPrevious();

    if(this.data.length < 1 ){
      return;
    }

    for (let row = 2; row < this.data.length;) {
      let line = this.data[row];

      //очищуємо попередні данні
      this.lastTaken = '';
      this.lastPassen = '';
      this.lastTakenCol = 0;

      //одразу встановлюємо вірний номер рядка
      row++;

      //встановлюємо усім строчкам що є пустими або розділювачами між територією чорний колір
      if(line.every(element => element == '')) {
          this.setPartDelimeter(row);
      }

      //встановлюємо усім строчкам де є 'Консьерж' світло жовтий колір
      this.setBackgroundConcierge(row, line);

      //ініціюємо змінні для останніх встановлених дат
      this.setLastDates(line);

      //перевіряємо чи є "просрочка" по датам і якщо так змінюємо колір потрібній строчці чи комірці
      if (!this.isOverdueLastDates(row)) {
          continue;
      }
    }
  }

  setBackgroundConcierge(row, line) {
    if(line.includes('Консьерж')) {
      this.sheet.getRange(row, 1, 1, this.headers.length).setBackground('#f5b041');
    }
  }

  setPartDelimeter(row) {
    this.sheet.getRange(row, 1, 1, this.headers.length).setBackground('black');
  }

  setLastDates(line) {
    for (let headerCol = 0; headerCol < this.headers.length; headerCol++) {
      if (this.headers[headerCol] == '') {
        continue;
      }

      let headerName = this.headers[headerCol],
        currentData = line[headerCol];

      if (headerName == 'Взят' && currentData != '') {
          this.lastTaken = new Date(currentData);
          this.lastTakenCol = headerCol;
      } else if (headerName == 'Сдан' && (currentData != '' || line[headerCol - 1] != '')) {
          this.lastPassen = currentData != '' ? new Date(currentData) : currentData;
      }
    }      
  }

  isOverdueLastDates(row) {      
    if (this.lastTaken == '' && this.lastPassen == '') {
      return false;
    }

    if (this.lastPassen != '') {
      let diffDays = ((this.today - this.lastPassen) / this.diffRound);

      if ((this.lastTaken == '' || this.lastPassen > this.lastTaken) && (diffDays > this.overdueDays)) { 
        this.sheet.getRange(row, 1, 1, this.headers.length).setBackground('#58d68d ');
      }
    } else {

      let diffDays = ((this.today - this.lastTaken) / this.diffRound);

      if (this.lastTaken != '' && (diffDays > this.overdueDays)) {
        this.sheet.getRange(row, this.lastTakenCol + 2).setBackground('#ec7063');
        this.sheet.getRange(row, 2).setBackground('#ec7063');

      }
    }

    return true;
  }

}
