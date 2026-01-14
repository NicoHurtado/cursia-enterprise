"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";

interface ContractManagerProps {
  contract: any;
  companyUsers: any[];
}

export function ContractManager({ contract, companyUsers }: ContractManagerProps) {
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter out users already in the contract
  const availableUsers = companyUsers.filter(
    (u) => !contract.preRegisteredUsers.some((p: any) => p.id === u.id)
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const [error, setError] = useState<string | null>(null);

  const handleAddUsers = async () => {
    if (selectedUsers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/contracts/${contract.id}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preRegisteredUserIds: selectedUsers }),
      });

      if (res.ok) {
        setSelectedUsers([]);
        router.refresh();
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (error) {
      console.error("Error adding users:", error);
      setError("Error al agregar usuarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Contrato</h1>
          <p className="text-muted-foreground">
            {contract.company.name} - {format(new Date(contract.startDate), "dd/MM/yyyy")} a {format(new Date(contract.endDate), "dd/MM/yyyy")}
          </p>
          <div className="mt-2">
            <span className={`px-2 py-1 rounded text-xs font-bold ${contract.maxUsers > 0 && (contract.users.length + contract.preRegisteredUsers.length) >= contract.maxUsers
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
              }`}>
              Usuarios: {contract.users.length + contract.preRegisteredUsers.length}
              {contract.maxUsers > 0 ? ` / ${contract.maxUsers}` : ' (Ilimitado)'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cursos Incluidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside">
              {contract.courses.map((course: any) => (
                <li key={course.id}>{course.title}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agregar Usuarios del Pre-registro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div className="border rounded-md max-h-60 overflow-y-auto p-2">
              {availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay usuarios disponibles para agregar.
                </p>
              ) : (
                availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUser(user.id)}
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm flex-1">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))
              )}
            </div>
            <Button onClick={handleAddUsers} disabled={loading || selectedUsers.length === 0} className="w-full">
              {loading ? "Agregando..." : "Agregar Seleccionados"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios Asignados al Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Show both registered Users and PreRegisteredUsers linked to contract */}
              {contract.users.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.nationalId || "-"}</TableCell>
                  <TableCell><span className="text-green-600 font-medium">Registrado</span></TableCell>
                </TableRow>
              ))}
              {contract.preRegisteredUsers.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.nationalId || "-"}</TableCell>
                  <TableCell><span className="text-yellow-600">Pendiente de Registro</span></TableCell>
                </TableRow>
              ))}
              {contract.users.length === 0 && contract.preRegisteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No hay usuarios asignados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
