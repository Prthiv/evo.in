'use client'

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { CuratedBundle } from "@/lib/types"

interface CuratedBundlesTableProps {
  data: CuratedBundle[]
}

export function CuratedBundlesTable({ data }: CuratedBundlesTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-center">Sort Order</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((bundle) => (
            <TableRow key={bundle.id}>
              <TableCell className="font-medium">{bundle.name}</TableCell>
              <TableCell>{bundle.description || "-"}</TableCell>
              <TableCell>{bundle.productIds.length} products</TableCell>
              <TableCell className="text-center">
                <Badge variant={bundle.isActive ? "default" : "secondary"}>
                  {bundle.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{bundle.sortOrder}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/studio/bundles/edit/${bundle.id}`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/studio/bundles/delete/${bundle.id}`}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}