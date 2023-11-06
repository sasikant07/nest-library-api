import { Test, TestingModule } from '@nestjs/testing';
import { BookService } from './book.service';
import { Book, Category } from './schemas/book.schema';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';
import { User } from 'src/auth/schemas/user.schema';

describe('BookService', () => {
  let bookService: BookService;
  let model: Model<Book>;

  const mockBook = {
    _id: '6540022f5baea9d8f3e2f482',
    user: '654001ee5baea9dBf3e2f47d',
    title: 'New Book',
    description: 'Book Description',
    author: 'Author',
    price: 100,
    category: Category.FANTASY,
  };

  const mockUser = {
    _id: "654001ee5baea9dBf3e2f47d",
    name: "John Doe",
    email: "johndoe@gmail.com",
  }

  const mockBookService = {
    findById: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: getModelToken(Book.name),
          useValue: mockBookService,
        },
      ],
    }).compile();

    bookService = module.get<BookService>(BookService);
    model = module.get<Model<Book>>(getModelToken(Book.name));
  });

  describe('findAllBooks', () => {
    it('should return an array of books', async () => {
      const query = { page: '1', keyword: 'test' };

      jest.spyOn(model, 'find').mockImplementation(
        () =>
          ({
            limit: () => ({
              skip: jest.fn().mockResolvedValue([mockBook]),
            }),
          }) as any,
      );

      const result = await bookService.findAllBooks(query);

      expect(model.find).toHaveBeenCalledWith({
        title: {
          $regex: 'test',
          $options: 'i', // i means case insensitive
        },
      });

      expect(result).toEqual([mockBook]);
    });
  });

  describe('createBook', () => {
    it('should create and return a book', async () => {
      const newBook = {
        title: 'New Book',
        description: 'Book Description',
        author: 'Author',
        price: 100,
        category: Category.FANTASY,
      };

    //   jest
    //     .spyOn(model, 'create')
    //     .mockImplementationOnce(() => Promise.resolve(mockBook));

    //   const result = await bookService.createBook(newBook as CreateBookDto, mockUser as User);

    //   expect(result).toEqual(mockBook);
    });
  });

  describe('findBook', () => {
    it('should find and return a book by ID', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockBook);

      const result = await bookService.findBook(mockBook._id);

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
      expect(result).toEqual(mockBook);
    });

    it('should throw BadRequestException if invalid ID is provided', async () => {
      const id = 'invalid-is';

      const isValidObjectIdMock = jest
        .spyOn(mongoose, 'isValidObjectId')
        .mockReturnValue(false);

      await expect(bookService.findBook(id)).rejects.toThrow(
        BadRequestException,
      );

      expect(isValidObjectIdMock).toHaveBeenCalledWith(id);
      isValidObjectIdMock.mockRestore();
    });

    it('should fthrow NotFoundException if book is not found', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(bookService.findBook(mockBook._id)).rejects.toThrow(
        NotFoundException,
      );

      expect(model.findById).toHaveBeenCalledWith(mockBook._id);
    });
  });

  describe('updateBook', () => {
    it('should update Book and return a book', async () => {
      const updatedBook = {...mockBook, title: "Updated Name"};
      const book = {title: "Updated Name"};

      jest.spyOn(model, "findByIdAndUpdate").mockResolvedValue(updatedBook);

      const result = await bookService.updateBook(mockBook._id, book as any);
      
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(mockBook._id, book, {
        new: true,
        runValidators: true,
      });

      expect(result.title).toEqual(book.title);
    });
  });

  describe('deleteBook', () => {
    it('should delete and return a book', async () => {
      jest.spyOn(model, "findByIdAndDelete").mockResolvedValue(mockBook);

      const result = await bookService.deleteBook(mockBook._id);
      
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockBook._id);

      expect(result).toEqual(mockBook);
    });
  });
});
