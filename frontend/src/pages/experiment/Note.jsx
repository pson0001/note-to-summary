import c from "./Experiment.module.scss";
import Icon from "../../assets/Icon";
import { experimentData } from "./data";
import { useState } from "react";

function Note({ onNoteAdded }) {
  const [notes, setNotes] = useState(experimentData.notes);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteName, setNoteName] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const handleAddNoteClick = () => {
    setIsAddingNote(true);
  };

  const handleSubmitNote = () => {
    if (noteContent.trim() && noteName.trim()) {
      const newNote = {
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        content: noteContent.trim(),
        tag: noteName.trim(),
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      // Update experimentData.notes so summary generation can access it
      experimentData.notes = updatedNotes;
      setNoteName("");
      setNoteContent("");
      setIsAddingNote(false);
      // Trigger summary regeneration
      if (onNoteAdded) {
        onNoteAdded();
      }
    }
  };

  const handleCancel = () => {
    setNoteName("");
    setNoteContent("");
    setIsAddingNote(false);
  };

  return (
    <div className={c.notesContainer}>
      {!isAddingNote ? (
        <button className={c.addNoteButton} onClick={handleAddNoteClick}>
          <Icon.Add size={20} />
          Add note
        </button>
      ) : (
        <div className={c.noteForm}>
          <textarea
            placeholder="Note content"
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className={c.noteTextarea}
            rows={4}
          />
          <input
            type="text"
            placeholder="Logged by"
            value={noteName}
            onChange={(e) => setNoteName(e.target.value)}
            className={c.noteInput}
          />
          <div className={c.noteFormActions}>
            <button className={c.cancelButton} onClick={handleCancel}>
              Cancel
            </button>
            <button
              className={c.submitButton}
              onClick={handleSubmitNote}
              disabled={!noteContent.trim() || !noteName.trim()}
            >
              Add note
            </button>
          </div>
        </div>
      )}
      <div className={c.notesList}>
        {notes.map((note, index) => (
          <div key={index} className={c.noteCard}>
            <div className={c.noteDate}>{note.date}</div>
            <div className={c.noteContent}>{note.content}</div>
            <div className={c.noteTag}>{note.tag}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Note;
