"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle, XCircle, Calendar, Users } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteButton } from "@/components/admin/delete-button";
import { CompanyAgentManager } from "@/components/admin/company-agent-manager";

interface CompanyManagerProps {
  company: any;
}

export function CompanyManager({ company }: CompanyManagerProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [manualEmail, setManualEmail] = useState("");
  const [manualAdding, setManualAdding] = useState(false);
  const [manualResult, setManualResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [contractForm, setContractForm] = useState({
    startDate: "",
    endDate: "",
    documentUrl: "",
    courseIds: [] as string[],
    maxUsers: "",
    adminEmail: "",
    status: "ACTIVE",
  });
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available courses (could be passed as prop or fetched)
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/admin/courses");
        if (res.ok) {
          const data = await res.json();
          setAvailableCourses(data);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/admin/companies/${company.id}/users/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setUploadResult(data);
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadResult({ errors: ["Error al subir el archivo"] });
    } finally {
      setUploading(false);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setManualAdding(true);
    setManualResult(null);

    try {
      const res = await fetch(`/api/admin/companies/${company.id}/users/manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: manualEmail.trim() }),
      });
      const data = await res.json();

      if (res.ok) {
        setManualResult({ success: true });
        setManualEmail("");
        router.refresh();
      } else {
        setManualResult({ error: data.error || "Error al agregar usuario" });
      }
    } catch (error) {
      console.error("Manual add error:", error);
      setManualResult({ error: "Error al agregar usuario" });
    } finally {
      setManualAdding(false);
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/companies/${company.id}/contracts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contractForm),
      });

      if (res.ok) {
        setContractForm({ startDate: "", endDate: "", documentUrl: "", courseIds: [], maxUsers: "", adminEmail: "", status: "ACTIVE" });
        router.refresh();
      }
    } catch (error) {
      console.error("Contract error:", error);
    }
  };

  const toggleCourse = (courseId: string) => {
    setContractForm(prev => {
      const exists = prev.courseIds.includes(courseId);
      if (exists) {
        return { ...prev, courseIds: prev.courseIds.filter(id => id !== courseId) };
      } else {
        return { ...prev, courseIds: [...prev.courseIds, courseId] };
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{company.name}</h1>
        <p className="text-muted-foreground">Gestión de Contratos y Usuarios</p>
      </div>

      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts">Contratos</TabsTrigger>
          <TabsTrigger value="users">Usuarios Pre-registrados</TabsTrigger>
          <TabsTrigger value="agent">Agente</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Contrato</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateContract} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input
                      type="date"
                      value={contractForm.startDate}
                      onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Input
                      type="date"
                      value={contractForm.endDate}
                      onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cantidad de Usuarios</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0 = Ilimitado"
                      value={contractForm.maxUsers}
                      onChange={(e) => setContractForm({ ...contractForm, maxUsers: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">0 para ilimitado</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={contractForm.status}
                      onChange={(e) => setContractForm({ ...contractForm, status: e.target.value })}
                    >
                      <option value="ACTIVE">Activo</option>
                      <option value="PENDING">Pendiente</option>
                      <option value="EXPIRED">Expirado</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email del Administrador del Contrato (Opcional)</Label>
                  <Input
                    type="email"
                    placeholder="admin@empresa.com"
                    value={contractForm.adminEmail}
                    onChange={(e) => setContractForm({ ...contractForm, adminEmail: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si el usuario no existe, se le asignará el rol al registrarse.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Cursos Incluidos</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border p-4 rounded-md max-h-40 overflow-y-auto">
                    {availableCourses.map(course => (
                      <div key={course.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`course-${course.id}`}
                          checked={contractForm.courseIds.includes(course.id)}
                          onCheckedChange={() => toggleCourse(course.id)}
                        />
                        <label
                          htmlFor={`course-${course.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {course.title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit">Crear Contrato</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Contratos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Fin</TableHead>
                    <TableHead>Cursos</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.contracts.map((contract: any) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${contract.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          contract.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          {contract.status}
                        </span>
                      </TableCell>
                      <TableCell>{format(new Date(contract.startDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(contract.endDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contract.courses?.map((c: any) => (
                            <span key={c.id} className="text-xs bg-secondary px-1 rounded">{c.title}</span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{contract._count?.users || 0} / {contract._count?.preRegisteredUsers || 0}</TableCell>
                      <TableCell>
                        <Link href={`/admin/contracts/${contract.id}`}>
                          <Button variant="outline" size="sm">
                            <Users className="w-4 h-4 mr-2" />
                            Gestionar
                          </Button>
                        </Link>
                        {contract.status === 'PENDING' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 ml-2"
                            onClick={async () => {
                              try {
                                await fetch(`/api/admin/contracts/${contract.id}/status`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'ACTIVE' })
                                });
                                router.refresh();
                              } catch (e) {
                                console.error(e);
                              }
                            }}
                          >
                            Activar
                          </Button>
                        )}
                        <DeleteButton
                          id={contract.id}
                          endpoint="/api/admin/contracts"
                          itemName="contrato"
                          className="ml-2"
                          variant="ghost"
                          size="sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {company.contracts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        No hay contratos registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agregar Usuario Manual</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualAdd} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="manual-email">Correo Electrónico</Label>
                    <Input
                      id="manual-email"
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={manualEmail}
                      onChange={(e) => setManualEmail(e.target.value)}
                      disabled={manualAdding}
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={manualAdding}>
                      {manualAdding ? "Agregando..." : "Agregar Usuario"}
                    </Button>
                  </div>
                </div>

                {manualResult && (
                  <div className={`p-3 rounded-lg ${manualResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2">
                      {manualResult.success ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            Usuario agregado exitosamente
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm text-red-600 font-medium">
                            {manualResult.error}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Carga Masiva de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent transition-colors">
                  <Input
                    type="file"
                    accept=".xlsx, .xls"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileUpload}
                    disabled={uploading}
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="font-medium">Click para subir Excel</span>
                    <span className="text-xs text-muted-foreground">
                      Formato: Nombre, Correo, Cédula
                    </span>
                  </Label>
                </div>

                {uploading && <p className="text-sm text-muted-foreground">Procesando archivo...</p>}

                {uploadResult && (
                  <div className={`p-4 rounded-lg ${uploadResult.errors?.length ? 'bg-red-50' : 'bg-green-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {uploadResult.errors?.length ? (
                        <XCircle className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      <span className="font-medium">
                        {uploadResult.success} usuarios procesados correctamente
                      </span>
                    </div>
                    {uploadResult.errors?.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-red-600 mt-2 max-h-40 overflow-y-auto">
                        {uploadResult.errors.map((err: string, i: number) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Usuarios Pre-registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Correo</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {company.preRegisteredUsers.map((user: any) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.nationalId || "-"}</TableCell>
                      <TableCell>
                        {user.isRegistered ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Registrado
                          </span>
                        ) : (
                          <span className="text-yellow-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Pendiente
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DeleteButton
                          id={user.id}
                          endpoint="/api/admin/preregistered-users"
                          itemName="usuario"
                          variant="ghost"
                          size="sm"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {company.preRegisteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                        No hay usuarios pre-registrados
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agent" className="space-y-6">
          <CompanyAgentManager companyId={company.id} companyName={company.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
