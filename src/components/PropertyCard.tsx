import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
} from "@mui/material";
import { PropertyResponse } from "@/lib/types";
import Link from "next/link";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);

export default function PropertyCard({
  property,
}: {
  property: PropertyResponse;
}) {
  const mainImage = property.propertyPics?.[0] || "/placeholder-property.jpg";

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={mainImage}
        alt={property.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom noWrap>
          {property.title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={property.propertyType} size="small" color="primary" />
          <Chip label={property.status} size="small" color="secondary" />
        </Stack>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {property.city} – {property.address}
        </Typography>
        <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
          {formatPrice(property.price)}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Typography variant="body2">
            <strong>{property.bedrooms}</strong> Beds
          </Typography>
          <Typography variant="body2">
            <strong>{property.bathrooms}</strong> Baths
          </Typography>
          <Typography variant="body2">
            <strong>{property.areaSize}</strong> {property.areaUnit}
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
          Agent: {property.agentName}
        </Typography>
      </CardContent>
      <Box sx={{ px: 2, pb: 2 }}>
        <Link href={`/property/${property.id}`} passHref>
          <Button variant="contained" fullWidth>
            View Details
          </Button>
        </Link>
      </Box>
    </Card>
  );
}
