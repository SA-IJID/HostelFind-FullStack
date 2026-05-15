from rest_framework import serializers
from .models import Hostel, HostelImage, SavedHostel


class HostelImageSerializer(serializers.ModelSerializer):
    url = serializers.ReadOnlyField()

    class Meta:
        model  = HostelImage
        fields = ["id", "url", "uploaded_at"]


class HostelSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)
    images         = HostelImageSerializer(many=True, read_only=True)
    avg_rating     = serializers.SerializerMethodField()

    class Meta:
        model  = Hostel
        fields = [
            "id", "name", "address", "city", "price", "type", "rooms",
            "amenities", "description", "contact", "status",
            "owner", "owner_username", "images", "avg_rating",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "owner", "owner_username", "created_at", "updated_at"]

    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum(r.rating for r in reviews) / len(reviews), 1)


class HostelCreateSerializer(serializers.ModelSerializer):
    # Accept up to 8 images as file uploads in one request
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False, max_length=8
    )

    class Meta:
        model  = Hostel
        fields = [
            "name", "address", "city", "price", "type",
            "rooms", "amenities", "description", "contact", "id_number",
            "uploaded_images",
        ]

    def create(self, validated_data):
        images_data = validated_data.pop("uploaded_images", [])
        hostel = Hostel.objects.create(
            owner=self.context["request"].user,
            **validated_data,
        )
        for img in images_data:
            HostelImage.objects.create(hostel=hostel, image=img)
        return hostel

    def update(self, instance, validated_data):
        images_data = validated_data.pop("uploaded_images", [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        for img in images_data:
            HostelImage.objects.create(hostel=instance, image=img)
        return instance


class SavedHostelSerializer(serializers.ModelSerializer):
    hostel = HostelSerializer(read_only=True)

    class Meta:
        model  = SavedHostel
        fields = ["id", "hostel", "saved_at"]
