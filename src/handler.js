const { nanoid } = require('nanoid');
const books = require('./books');

const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
};

const createErrorResponse = (h, statusCode, message) => {
  const response = h.response({
    status: 'fail',
    message,
  });
  return response.code(statusCode);
};

const createSuccessResponse = (h, message) => {
  const response = h.response({
    status: 'success',
    message,
  });
  return response.code(HTTP_STATUS.SUCCESS);
};

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    return createErrorResponse(h, HTTP_STATUS.BAD_REQUEST, 'Gagal menambahkan buku. Mohon isi nama buku');
  }

  if (readPage > pageCount) {
    return createErrorResponse(h, HTTP_STATUS.BAD_REQUEST, 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount');
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.find((book) => book.id === id);

  if (isSuccess) {
    return h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    }).code(HTTP_STATUS.CREATED);
  }

  return createErrorResponse(h, HTTP_STATUS.SERVER_ERROR, 'Buku gagal ditambahkan');
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  let filteredBooks = books;

  if (name) {
    const searchName = name.toLowerCase();
    filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(searchName));
  }
  if (reading) {
    const isReading = Boolean(parseInt(reading, 10));
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }
  if (finished) {
    const isFinished = Boolean(parseInt(finished, 10));
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  const responseBooks = filteredBooks.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  return h.response({
    status: 'success',
    data: {
      books: responseBooks,
    },
  }).code(HTTP_STATUS.SUCCESS);
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.find((n) => n.id === id);

  if (book) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  return createErrorResponse(h, HTTP_STATUS.NOT_FOUND, 'Buku tidak ditemukan');
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  if (!name) {
    return createErrorResponse(h, HTTP_STATUS.BAD_REQUEST, 'Gagal memperbarui buku. Mohon isi nama buku');
  }

  if (readPage > pageCount) {
    return createErrorResponse(h, HTTP_STATUS.BAD_REQUEST, 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount');
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    const updatedBook = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    books[index] = updatedBook;

    return createSuccessResponse(h, 'Buku berhasil diperbarui');
  }

  return createErrorResponse(h, HTTP_STATUS.NOT_FOUND, 'Gagal memperbarui buku. Id tidak ditemukan');
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    return createSuccessResponse(h, 'Buku berhasil dihapus');
  }

  return createErrorResponse(h, HTTP_STATUS.NOT_FOUND, 'Buku gagal dihapus. Id tidak ditemukan');
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
