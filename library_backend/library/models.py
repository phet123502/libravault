from django.db import models
from django.contrib.auth.hashers import make_password


class User(models.Model):
    ROLE_CHOICES = [('Admin', 'Admin'), ('User', 'User')]
    name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='User')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lv_users'

    def __str__(self):
        return f'{self.name} ({self.role})'


class Book(models.Model):
    title = models.CharField(max_length=300)
    author = models.CharField(max_length=200)
    genre = models.CharField(max_length=100, blank=True, default='General')
    isbn = models.CharField(max_length=50, blank=True)
    stock = models.PositiveIntegerField(default=1)
    year = models.IntegerField(null=True, blank=True)
    emoji = models.CharField(max_length=10, default='📖')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lv_books'

    def __str__(self):
        return self.title


class Issue(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='issues')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issues')
    issue_date = models.DateField()
    due_date = models.DateField()
    returned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lv_issues'

    def __str__(self):
        return f'{self.user.name} → {self.book.title}'
