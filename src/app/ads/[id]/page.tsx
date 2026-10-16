import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export default async function LegacyAdDetails({ params }: Props) {
 const { id } = await params;
 redirect(`/ad/${id}`);
}
