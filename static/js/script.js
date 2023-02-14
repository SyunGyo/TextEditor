
class CursorController {
  constructor() {
    this.cursor_element = document.getElementById("cursor_fig");
    this.pos_id = null;
    this.pos_type = null;
    this.line_num = null;
    this.char_num = null;
  }

  GetPos() {
    if (this.pos_id == 'CH') {
      return [this.pos_id, Number(this.pos_id.slice(2, this.pos_id.length).split("_")[0]), Number(this.pos_id.slice(2, this.pos_id.length).split("_")[1])];
    } else if (this.pos_id == 'TG') {
      return [this.pos_id, Number(this.pos_id.slice(2, this.pos_id.length))];
    }
  }

  MoveAtID(pos_id) {
    console.log(pos_id);
    this.pos_id = pos_id;
    const target_char = document.getElementById(pos_id);
    console.log(target_char);
    const AttachedLine = target_char.parentElement;

    this.cursor_element.style.top = target_char.getBoundingClientRect().top - this.cursor_element.parentElement.getBoundingClientRect().top;
    this.cursor_element.style.left = target_char.getBoundingClientRect().right - AttachedLine.getBoundingClientRect().left;
    console.log("check: %d %d", target_char.getBoundingClientRect().top);

    if (pos_id.slice(0, 2) == 'CH') {
      this.pos_type = 'CH';
      this.line_num = Number(pos_id.slice(2, pos_id.length).split("_")[0]);
      this.char_num = Number(pos_id.slice(2, pos_id.length).split("_")[1]);
    } else if (pos_id.slice(0, 2) == 'TG') {
      this.pos_type = 'TG';
      this.line_num = Number(pos_id.slice(2, pos_id.length).split("_")[0]);
      this.char_num = null;
    }
  }

  MoveAtLineEnd(line_num) {
    this.MoveAtID(document.getElementById('l' + String(line_num)).lastElementChild.id);
  }

  MoveAtLineStart(line_num) {
    console.log("Move At Line Start: %d", line_num);
    console.log("Move to: " + document.getElementById('l' + String(line_num)).firstElementChild.id);
    this.MoveAtID(document.getElementById('l' + String(line_num)).firstElementChild.id)
  }

  MoveRight() {
    let next_element = document.getElementById(this.pos_id).nextElementSibling;
    if (next_element == null) {
      if (document.getElementById('l' + String(this.line_num + 1)) == null) return;
      this.MoveAtLineStart(this.line_num + 1);
    } else {
      this.MoveAtID(next_element.id);
    }
  }

  MoveLeft() {
    let pre_element = document.getElementById(this.pos_id).previousElementSibling;
    console.log("MoveLeft :");
    console.log(pre_element);
    if (pre_element == null) {
      if (document.getElementById('l' + String(this.line_num - 1)) == null) return;
      this.MoveAtLineEnd(this.line_num - 1);
    } else {
      console.log(pre_element.parentElement);
      this.MoveAtID(pre_element.id);
    }
  }
}

function start_func() {
  display_update();
  CursorC.MoveAtID(document.getElementById("text_form").lastElementChild.lastElementChild.id);
}

function display_update() {
  document.getElementById("text_form").innerHTML = "";

  for (let i = 0; i < TextData.length; i++) {
    make_line(i);
    make_topguard(i);
    for (let j = 0; j < TextData[i].length; j++) {
      CharID = "CH" + String(i) + "_" + String(j);
      make_charobj(TextData[i].charAt(j), i, CharID);
    }
  }
}

function make_charobj(Char, line, CharID) {
  let new_char = document.createElement("div");
  new_char.className = "char";
  new_char.id = CharID;
  new_char.addEventListener("click", move_cursor_ByClick);
  if (Char == " ") {
    new_char.textContent = "\u00A0";
  } else {
    new_char.textContent = Char;
  }

  document.getElementById("l" + String(line)).appendChild(new_char);
}

function make_topguard(line) {
  let new_topguard = document.createElement("div");
  new_topguard.className = "topguard";
  new_topguard.id = "TG" + String(line);
  new_topguard.addEventListener("click", move_cursor_ByClick);

  document.getElementById("l" + String(line)).appendChild(new_topguard);
}

function change_text(New_Char) {
  if (CursorC.pos_type == 'CH') {
    const pre_words = TextData[CursorC.line_num].slice(0, CursorC.char_num + 1);
    const after_words = TextData[CursorC.line_num].slice(CursorC.char_num + 1, TextData[CursorC.line_num].length);

    TextData[CursorC.line_num] = pre_words + New_Char + after_words;
    display_update();
    CursorC.MoveAtID("CH" + String(CursorC.line_num) + "_" + String(CursorC.char_num + 1));
  } else if (CursorC.pos_type == 'TG') {
    TextData[CursorC.line_num] = New_Char + TextData[CursorC.line_num];
    display_update();
    CursorC.MoveAtID("CH" + String(CursorC.line_num) + "_" + String(0));
  }
}

function erase_text() {
  if (CursorC.pos_type == 'CH') {
    const pre_words = TextData[CursorC.line_num].slice(0, CursorC.char_num);
    const after_words = TextData[CursorC.line_num].slice(CursorC.char_num + 1, TextData[CursorC.line_num].length);

    TextData[CursorC.line_num] = pre_words + after_words;
    display_update();
    if (CursorC.char_num == 0) {
      CursorC.MoveAtID('TG' + String(CursorC.line_num));
    } else {
      CursorC.MoveAtID('CH' + String(CursorC.line_num) + '_' + String(CursorC.char_num - 1));
    }
  } else if (CursorC.pos_type == 'TG') {
    if (CursorC.line_num == 0) return;
    else {
      let pre_id = document.getElementById("l" + String(CursorC.line_num - 1)).lastElementChild.id;
      TextData[CursorC.line_num - 1] = TextData[CursorC.line_num - 1] + TextData[CursorC.line_num];
      TextData.splice(CursorC.line_num, 1);
      display_update();
      CursorC.MoveAtID(pre_id);
    }
  }
}

function make_line(line_num) {
  var new_line = document.createElement("div");
  new_line.className = "line";
  new_line.id = "l" + String(line_num);
  document.getElementById("text_form").appendChild(new_line);
}

function break_line() {
  if (CursorC.pos_type == 'TG') {
    TextData.splice(CursorC.line_num + 1,0,TextData[CursorC.line_num].slice(0, TextData[CursorC.line_num].length));
    TextData[CursorC.line_num] = "";
  } else if (CursorC.pos_type == 'CH') {
    TextData.splice(CursorC.line_num + 1, 0, TextData[CursorC.line_num].slice(CursorC.char_num + 1, TextData[CursorC.line_num].length));
    TextData[CursorC.line_num] = TextData[CursorC.line_num].slice(0, CursorC.char_num + 1);
  }
  display_update();
  console.log("Linenum: %d", CursorC.line_num + 1);
  CursorC.MoveAtLineStart(CursorC.line_num + 1);
}

function keypress_event(e) {
  console.log(e.code);
  console.log(e.key);

  if (e.key == "Shift") return;
  if (e.key == "ArrowLeft") {
    CursorC.MoveLeft();
    return;
  }

  if (e.key == "ArrowRight") {
    CursorC.MoveRight();
    return;
  }

  if (e.key == "Enter") {
    break_line();
    return;
  }

  if (e.code == "Space") {
    change_text(" ");
    return;
  }

  if (e.key == "Backspace") {
    erase_text();
    return;
  }
  // type_char(e.key);
  console.log("Type: Character Key");
  change_text(e.key);

  return;
}

function move_cursor_ByClick(event) {
  CursorC.MoveAtID(event.target.id);
}

document.addEventListener("keydown", keypress_event);
TextData = [""];
CursorC = new CursorController();

window.onload = start_func();
