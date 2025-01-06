import React, { useState, useEffect } from "react";
import axios from "axios";
import BookDetail from "./BookDetail";
import "./BooksSearch.css";

const BooksSearch = () => {
  const [searchTerm, setSearchTerm] = useState(""); // Search term
  const [allBooks, setAllBooks] = useState([]); // Store all books
  const [filteredBooks, setFilteredBooks] = useState([]); // Store filtered books
  const [selectedBook, setSelectedBook] = useState(null); // Store the selected book

  // Fetch all books when the component is first mounted
  const fetchAllBooks = async () => {
    try {
      const response = await axios.get("/books"); // Fetch all books
      setAllBooks(response.data);
      setFilteredBooks(response.data); // Initially show all books
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // Use useEffect to fetch all books when the component is mounted
  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Handle search
  const handleSearch = () => {
    const filtered = allBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBooks(filtered); // Update filtered books list
  };

  // Handle when a book is clicked for detailed view
  const handleBookClick = (book) => {
    setSelectedBook(book); // Show detailed info for the selected book
  };

  // Handle returning to the search results view
  const handleBackToSearch = () => {
    setSelectedBook(null); // Go back to the search results view
  };

  // Automatically refresh the list after actions like check-out or check-in
  const refreshBooksList = () => {
    fetchAllBooks(); // Re-fetch the list of all books after an action like check-out or check-in
  };

  return (
    <div>
      {!selectedBook ? (
        // Show search bar and filtered books list
        <div>
          <button onClick={refreshBooksList}><p>REFRESH</p></button>
          <div className="columns-container">
            {/* Available Books Column */}
            <div className="column available">
              <h3>Available Books</h3>
              <ul>
                {filteredBooks
                  .filter((book) => book.avail === true)
                  .map((book) => (
                    <li key={book.id} onClick={() => handleBookClick(book)}>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>

            {/* Unavailable Books Column */}
            <div className="column unavailable">
              <h3>Unavailable Books</h3>
              <ul>
                {filteredBooks
                  .filter((book) => book.avail === false)
                  .map((book) => (
                    <li key={book.id} onClick={() => handleBookClick(book)}>
                      <div className="book-info">
                        <h3>{book.title}</h3>
                        <p>{book.author}</p>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or author"
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      ) : (
        // Show selected book details when a book is clicked
        <BookDetail book={selectedBook} onBack={handleBackToSearch} onBookAction={refreshBooksList} />
      )}
    </div>
  );
};

export default BooksSearch;
