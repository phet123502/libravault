from django.contrib import admin
from .models import User, Book, Issue


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('name', 'email')


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'genre', 'stock', 'year')
    list_filter = ('genre',)
    search_fields = ('title', 'author', 'isbn')


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ('id', 'book', 'user', 'issue_date', 'due_date', 'returned')
    list_filter = ('returned',)
    search_fields = ('book__title', 'user__name')
