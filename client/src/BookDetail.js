import React, { useState } from "react";
import axios from "axios";

const BookDetail = ({ book, onBack, onBookAction }) => {
  const [avail, setAvail] = useState(book.avail);
  const [who, setWho] = useState("");  // Name of the person checking out the book
  const [due, setDue] = useState("");  // Due date for the book

  const handleCheckInOut = async () => {
    if (avail) {
      // Check-out logic
      if (!who || !due) {
        alert("Please enter your name and select a due date.");
        return;
      }

      // Update availability, who (name), and due date when checking out
      const updatedAvailability = false;

      try {
        await axios.put(`/books/${book.id}`, {
          avail: updatedAvailability,
          who: who,
          due: due,
        });

        setAvail(updatedAvailability);  // Update local state for availability
        onBookAction();
      } catch (err) {
        console.error("Error updating book availability:", err);
      }
    } else {
      // Check-in logic (book is being returned)
      const updatedAvailability = true;
      try {
        await axios.put(`/books/${book.id}`, {
          avail: updatedAvailability,
          who: "",  // Clear the person who checked it out
          due: "",  // Clear the due date
        });

        setAvail(updatedAvailability);  // Update local state for availability
        onBookAction();
      } catch (err) {
        console.error("Error checking in book:", err);
      }
    }
  };

  return (
    <div>
      <h2>Title: {book.title}</h2>
      <p>Author: {book.author}</p>
      <p>Publisher: {book.publisher}</p>
      <p>ISBN: {book.isbn}</p>
      <p>Status: {avail ? "Available" : "Checked Out"}</p>

      {avail === false && (
        <div>
          <p>Checked out by: {book.who}</p>
          <p>Due Date: {new Date(book.due).toLocaleDateString()}</p>
        </div>
      )}

      {avail && (
        <div>
          <label>Enter your name:</label>
          <input
            type="text"
            value={who}
            onChange={(e) => setWho(e.target.value)}
          />

          <label>Due Date:</label>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
        </div>
      )}

      <button onClick={handleCheckInOut}>
        {avail ? "Check Out" : "Check In"}
      </button>
      <button onClick={onBack}>Back to Search Results</button>
    </div>
  );
};

export default BookDetail;


