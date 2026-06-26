import json
import random
from datetime import date, timedelta

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password, check_password

from .models import User, Book, Issue

EMOJIS = ['📗', '📘', '📙', '📕', '📒', '📓', '📔', '📖']


def _body(request):
    return json.loads(request.body or '{}')


# ── Auth ──────────────────────────────────────────────────────────────────────

@csrf_exempt
def signin(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    data = _body(request)
    email = data.get('email', '').strip()
    password = data.get('password', '')
    role = data.get('role', 'User')

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Invalid email or password.'}, status=401)

    if not check_password(password, user.password):
        return JsonResponse({'error': 'Invalid email or password.'}, status=401)

    if role == 'Admin' and user.role != 'Admin':
        return JsonResponse({'error': 'This account does not have Admin privileges.'}, status=403)
    if role == 'User' and user.role == 'Admin':
        return JsonResponse({'error': 'Admin accounts must log in via the Admin tab.'}, status=403)

    return JsonResponse({'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role})


@csrf_exempt
def signup(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    data = _body(request)
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return JsonResponse({'error': 'All fields are required.'}, status=400)
    if len(password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters.'}, status=400)
    if User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'An account with this email already exists.'}, status=400)

    user = User.objects.create(name=name, email=email, password=make_password(password), role='User')
    return JsonResponse({'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}, status=201)


@csrf_exempt
def verify_email(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    data = _body(request)
    email = data.get('email', '').strip()
    if not email:
        return JsonResponse({'error': 'Enter your email address.'}, status=400)
    if not User.objects.filter(email=email).exists():
        return JsonResponse({'error': 'No account found with that email.'}, status=404)
    return JsonResponse({'message': 'Email verified!'})


@csrf_exempt
def reset_password(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    data = _body(request)
    email = data.get('email', '').strip()
    new_password = data.get('new_password', '')
    if len(new_password) < 6:
        return JsonResponse({'error': 'Password must be at least 6 characters.'}, status=400)
    try:
        user = User.objects.get(email=email)
        user.password = make_password(new_password)
        user.save()
        return JsonResponse({'message': 'Password reset successfully!'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'No account found.'}, status=404)


# ── Books ─────────────────────────────────────────────────────────────────────

@csrf_exempt
def books(request):
    if request.method == 'GET':
        result = []
        for b in Book.objects.all():
            issued = Issue.objects.filter(book=b, returned=False).count()
            result.append({
                'id': b.id, 'title': b.title, 'author': b.author,
                'genre': b.genre, 'isbn': b.isbn, 'stock': b.stock,
                'year': b.year, 'emoji': b.emoji,
                'available': max(0, b.stock - issued),
            })
        return JsonResponse({'books': result})

    if request.method == 'POST':
        data = _body(request)
        title = data.get('title', '').strip()
        author = data.get('author', '').strip()
        if not title or not author:
            return JsonResponse({'error': 'Title and author are required.'}, status=400)
        book = Book.objects.create(
            title=title, author=author,
            genre=data.get('genre', 'General') or 'General',
            isbn=data.get('isbn', ''),
            stock=int(data.get('stock', 1) or 1),
            year=data.get('year') or None,
            emoji=random.choice(EMOJIS),
        )
        return JsonResponse({'id': book.id, 'title': book.title, 'message': 'Book added.'}, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def book_detail(request, book_id):
    try:
        book = Book.objects.get(id=book_id)
    except Book.DoesNotExist:
        return JsonResponse({'error': 'Book not found.'}, status=404)

    if request.method == 'PUT':
        data = _body(request)
        book.title = data.get('title', book.title).strip()
        book.author = data.get('author', book.author).strip()
        book.genre = data.get('genre', book.genre).strip()
        book.stock = int(data.get('stock', book.stock) or 1)
        book.save()
        return JsonResponse({'message': 'Book updated.'})

    if request.method == 'DELETE':
        book.delete()
        return JsonResponse({'message': 'Book deleted.'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ── Users ─────────────────────────────────────────────────────────────────────

@csrf_exempt
def users(request):
    if request.method == 'GET':
        result = []
        for u in User.objects.all():
            borrowed = Issue.objects.filter(user=u, returned=False).count()
            result.append({
                'id': u.id, 'name': u.name, 'email': u.email,
                'role': u.role, 'borrowed': borrowed,
            })
        return JsonResponse({'users': result})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def user_detail(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)

    if request.method == 'PUT':
        data = _body(request)
        user.name = data.get('name', user.name).strip()
        user.email = data.get('email', user.email).strip()
        user.role = data.get('role', user.role)
        user.save()
        return JsonResponse({'message': 'User updated.'})

    if request.method == 'DELETE':
        user.delete()
        return JsonResponse({'message': 'User deleted.'})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ── Issues ────────────────────────────────────────────────────────────────────

@csrf_exempt
def issues(request):
    if request.method == 'GET':
        user_id = request.GET.get('user_id')
        book_id = request.GET.get('book_id')
        qs = Issue.objects.select_related('book', 'user').all().order_by('-created_at')
        if user_id:
            qs = qs.filter(user_id=user_id)
        if book_id:
            qs = qs.filter(book_id=book_id, returned=False)
        result = []
        today = date.today()
        for i in qs:
            result.append({
                'id': i.id,
                'bookId': i.book.id, 'bookTitle': i.book.title, 'bookEmoji': i.book.emoji,
                'userId': i.user.id, 'userName': i.user.name,
                'issueDate': str(i.issue_date), 'dueDate': str(i.due_date),
                'returned': i.returned,
                'overdue': not i.returned and i.due_date < today,
            })
        return JsonResponse({'issues': result})

    if request.method == 'POST':
        data = _body(request)
        book_id = data.get('bookId')
        user_id = data.get('userId')

        try:
            book = Book.objects.get(id=book_id)
            user = User.objects.get(id=user_id)
        except (Book.DoesNotExist, User.DoesNotExist):
            return JsonResponse({'error': 'Book or user not found.'}, status=404)

        if Issue.objects.filter(book=book, user=user, returned=False).exists():
            return JsonResponse({'error': 'You already have this book borrowed.'}, status=400)

        issued = Issue.objects.filter(book=book, returned=False).count()
        if issued >= book.stock:
            return JsonResponse({'error': 'No copies available.'}, status=400)

        today = date.today()
        due_date_str = data.get('dueDate')
        if due_date_str:
            from datetime import datetime as dt
            due = dt.strptime(due_date_str, '%Y-%m-%d').date()
        else:
            due = today + timedelta(days=14)
        issue = Issue.objects.create(book=book, user=user, issue_date=today, due_date=due)
        return JsonResponse({
            'id': issue.id, 'dueDate': str(issue.due_date),
            'message': f'Borrowed! Due by {issue.due_date}.',
        }, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def return_book(request, issue_id):
    if request.method != 'PUT':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        issue = Issue.objects.get(id=issue_id)
        issue.returned = True
        issue.save()
        return JsonResponse({'message': 'Book marked as returned.'})
    except Issue.DoesNotExist:
        return JsonResponse({'error': 'Issue not found.'}, status=404)


@csrf_exempt
def delete_issue(request, issue_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    try:
        Issue.objects.get(id=issue_id).delete()
        return JsonResponse({'message': 'Issue record deleted.'})
    except Issue.DoesNotExist:
        return JsonResponse({'error': 'Issue not found.'}, status=404)


# ── Dashboards ────────────────────────────────────────────────────────────────

def admin_dashboard(request):
    today = date.today()
    total_books = Book.objects.count()
    total_members = User.objects.filter(role='User').count()
    active_issues = Issue.objects.filter(returned=False).count()
    overdue_count = Issue.objects.filter(returned=False, due_date__lt=today).count()

    # Per-book availability breakdown
    available_copies = 0
    books_status = []
    for b in Book.objects.all().order_by('title'):
        issued = Issue.objects.filter(book=b, returned=False).count()
        avail = max(0, b.stock - issued)
        available_copies += avail
        books_status.append({
            'id': b.id, 'title': b.title, 'emoji': b.emoji, 'genre': b.genre,
            'stock': b.stock, 'issued': issued, 'available': avail,
        })

    recent = Issue.objects.select_related('book', 'user').filter(returned=False).order_by('-created_at')[:5]
    activity = [
        {'text': f'<b>{i.user.name}</b> borrowed <b>{i.book.title}</b>', 'time': str(i.issue_date)}
        for i in recent
    ]

    overdue_qs = Issue.objects.select_related('book', 'user').filter(returned=False, due_date__lt=today)
    overdue_list = [
        {'bookTitle': i.book.title, 'userName': i.user.name, 'daysOverdue': (today - i.due_date).days}
        for i in overdue_qs
    ]

    return JsonResponse({
        'totalBooks': total_books, 'totalMembers': total_members,
        'activeIssues': active_issues, 'overdue': overdue_count,
        'availableCopies': available_copies,
        'booksStatus': books_status,
        'activity': activity, 'overdueList': overdue_list,
    })


def user_dashboard(request, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found.'}, status=404)

    today = date.today()
    my_active = Issue.objects.filter(user=user, returned=False).select_related('book')
    my_returned = Issue.objects.filter(user=user, returned=True).select_related('book')

    borrowed_list = [
        {
            'bookTitle': i.book.title, 'bookEmoji': i.book.emoji,
            'dueDate': str(i.due_date), 'overdue': i.due_date < today,
        }
        for i in my_active
    ]
    history = [
        {'bookTitle': i.book.title, 'dueDate': str(i.due_date)}
        for i in my_returned
    ]

    return JsonResponse({
        'borrowedCount': my_active.count(),
        'returnedCount': my_returned.count(),
        'totalBooks': Book.objects.count(),
        'overdue': my_active.filter(due_date__lt=today).count(),
        'borrowedList': borrowed_list,
        'history': history,
    })
