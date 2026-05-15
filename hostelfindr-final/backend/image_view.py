from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import HostelImage
from accounts.permissions import IsLandlord


class DeleteHostelImageView(APIView):
    """
    DELETE /api/hostels/images/<image_id>/
    Landlord can remove a single image from their hostel.
    The file is deleted from Cloudinary automatically because
    django-cloudinary-storage hooks into Django's storage delete.
    """
    permission_classes = [IsLandlord]

    def delete(self, request, pk):
        try:
            img = HostelImage.objects.get(pk=pk, hostel__owner=request.user)
        except HostelImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)

        img.image.delete(save=False)   # removes from Cloudinary
        img.delete()
        return Response({"detail": "Image deleted."}, status=status.HTTP_204_NO_CONTENT)
