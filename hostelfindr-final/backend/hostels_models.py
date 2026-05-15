from django.db import models
from django.conf import settings


class Hostel(models.Model):
    TYPE_CHOICES = [
        ("mixed",  "Mixed"),
        ("male",   "Male only"),
        ("female", "Female only"),
    ]
    STATUS_CHOICES = [
        ("pending",  "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    name        = models.CharField(max_length=200)
    address     = models.CharField(max_length=300)
    city        = models.CharField(max_length=100)
    price       = models.PositiveIntegerField(help_text="Monthly rent in GH₵")
    type        = models.CharField(max_length=10, choices=TYPE_CHOICES, default="mixed")
    rooms       = models.PositiveIntegerField(default=0)
    amenities   = models.JSONField(default=list, blank=True)
    description = models.TextField(blank=True)
    contact     = models.CharField(max_length=20, blank=True)
    id_number   = models.CharField(max_length=50, blank=True)
    owner       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="hostels",
    )
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "hostels"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.city}) — {self.status}"


class HostelImage(models.Model):
    """
    Each hostel can have multiple images stored on Cloudinary.
    Using a separate model (instead of JSONField) means we can
    delete images individually and get proper Cloudinary URLs.
    """
    hostel     = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name="images")
    image      = models.ImageField(upload_to="hostels/")   # Cloudinary path prefix
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "hostel_images"

    @property
    def url(self):
        return self.image.url if self.image else None


class SavedHostel(models.Model):
    student  = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_hostels"
    )
    hostel   = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name="saves")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = "saved_hostels"
        unique_together = ("student", "hostel")
