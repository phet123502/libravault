from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth.hashers import make_password
from library.models import User, Book, Issue


class Command(BaseCommand):
    help = 'Seed the database with initial demo data'

    def handle(self, *args, **kwargs):
        if User.objects.exists():
            self.stdout.write(self.style.WARNING('Database already seeded. Skipping.'))
            return

        admin = User.objects.create(
            name='Admin User', email='admin@libravault.com',
            password=make_password('admin123'), role='Admin',
        )
        jane = User.objects.create(
            name='Jane Reader', email='user@libravault.com',
            password=make_password('user123'), role='User',
        )
        ravi = User.objects.create(
            name='Ravi Patel', email='ravi@libravault.com',
            password=make_password('ravi123'), role='User',
        )

        books_data = [
            ('The Great Gatsby', 'F. Scott Fitzgerald', 'Classic', '978-0-7432-7356-5', 3, 1925, '📗'),
            ('To Kill a Mockingbird', 'Harper Lee', 'Drama', '978-0-06-112008-4', 2, 1960, '📘'),
            ('Sapiens', 'Yuval Noah Harari', 'History', '978-0-06-231609-7', 4, 2011, '📙'),
            ('Atomic Habits', 'James Clear', 'Self-Help', '978-0-7352-1129-2', 5, 2018, '📕'),
            ('The Alchemist', 'Paulo Coelho', 'Fiction', '978-0-06-250218-5', 3, 1988, '📒'),
            ('Thinking, Fast and Slow', 'Daniel Kahneman', 'Psychology', '978-0-374-27563-1', 2, 2011, '📓'),
            ('Clean Code', 'Robert C. Martin', 'Technology', '978-0-13-235088-4', 2, 2008, '💻'),
            ('1984', 'George Orwell', 'Dystopia', '978-0-45-228285-3', 1, 1949, '📔'),
        ]
        created_books = []
        for title, author, genre, isbn, stock, year, emoji in books_data:
            b = Book.objects.create(
                title=title, author=author, genre=genre,
                isbn=isbn, stock=stock, year=year, emoji=emoji,
            )
            created_books.append(b)

        today = date.today()
        Issue.objects.create(
            book=created_books[1], user=jane,
            issue_date=today - timedelta(days=14),
            due_date=today,
            returned=False,
        )
        Issue.objects.create(
            book=created_books[4], user=ravi,
            issue_date=today - timedelta(days=7),
            due_date=today + timedelta(days=7),
            returned=False,
        )
        Issue.objects.create(
            book=created_books[0], user=jane,
            issue_date=today - timedelta(days=30),
            due_date=today - timedelta(days=16),
            returned=True,
        )

        self.stdout.write(self.style.SUCCESS(
            'Seeded: 3 users, 8 books, 3 issues.\n'
            '  Admin: admin@libravault.com / admin123\n'
            '  User:  user@libravault.com / user123'
        ))
