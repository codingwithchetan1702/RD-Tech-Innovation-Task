from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardAPIView(APIView):
    """
    Mock dashboard metrics used by the frontend.
    """

    permission_classes = [AllowAny] if settings.DEBUG else [IsAuthenticated]

    def get(self, request):
        user_growth = [
            {"month": "2026-01", "growth": 120},
            {"month": "2026-02", "growth": 165},
            {"month": "2026-03", "growth": 210},
            {"month": "2026-04", "growth": 195},
            {"month": "2026-05", "growth": 260},
        ]

        sales_figures = {
            "labels": ["Jan", "Feb", "Mar", "Apr", "May"],
            "values": [3200, 4100, 3900, 5200, 6100],
        }

        recent_activity = [
            {"id": 1, "event": "Invoice created", "at": "2026-03-30T10:10:00Z"},
            {"id": 2, "event": "Task completed", "at": "2026-03-29T18:45:00Z"},
            {"id": 3, "event": "Permissions updated", "at": "2026-03-28T09:20:00Z"},
        ]

        return Response(
            {
                "user_growth": user_growth,
                "sales_figures": sales_figures,
                "recent_activity": recent_activity,
            }
        )
