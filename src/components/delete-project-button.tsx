"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteProjectButtonProps {
  projectId: number;
  projectName: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}

export default function DeleteProjectButton({
  projectId,
  projectName,
  redirectTo,
  variant = "icon",
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Falha ao deletar briefing");
      }

      toast.success("Briefing deletado.");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível deletar. Tente novamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={variant === "icon" ? "ghost" : "outline"}
          size={variant === "icon" ? "icon" : "sm"}
          className={
            variant === "icon"
              ? "h-9 w-9 rounded-lg text-[hsl(30,15%,50%)] hover:bg-red-50 hover:text-red-600"
              : "rounded-lg border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          }
          disabled={isDeleting}
          aria-label={`Deletar ${projectName}`}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          {variant === "button" && <span className="ml-2">Deletar</span>}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar briefing?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso vai remover "{projectName}" do dashboard. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              void handleDelete();
            }}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
